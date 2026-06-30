/* ============================================================
   SkyLab physics core.  All formulas physically grounded and
   matched to the EASA 081 "Principles of Flight" syllabus.
   Units: SI internally (m, s, kg, Pa, N). Helpers convert.
   ============================================================ */
(function(){
const P = {};

/* ---------- constants ---------- */
P.g    = 9.80665;      // m/s^2
P.rho0 = 1.225;        // kg/m^3  ISA sea-level density
P.p0   = 101325;       // Pa
P.T0   = 288.15;       // K (15 °C)
P.L    = 0.0065;       // K/m temperature lapse (troposphere)
P.R    = 287.05;       // J/(kg K)

/* ---------- conversions ---------- */
P.kt2ms = function(k){ return k*0.514444; };
P.ms2kt = function(v){ return v/0.514444; };
P.ft2m  = function(f){ return f*0.3048; };
P.m2ft  = function(m){ return m/0.3048; };
P.deg   = function(r){ return r*180/Math.PI; };
P.rad   = function(d){ return d*Math.PI/180; };

/* ---------- ISA atmosphere (troposphere, 0..11 km) ---------- */
// altitude in metres -> {T(K), p(Pa), rho(kg/m^3), a(speed of sound)}
P.isa = function(hMeters){
  var h = Math.max(-500, Math.min(11000, hMeters));
  var T = P.T0 - P.L*h;
  var p = P.p0 * Math.pow(T/P.T0, P.g/(P.R*P.L));
  var rho = p/(P.R*T);
  var a = Math.sqrt(1.4*P.R*T);
  return {T:T, Tc:T-273.15, p:p, rho:rho, a:a, sigma:rho/P.rho0};
};

/* ---------- dynamic pressure  q = ½ρv²  (Staudruck) ---------- */
P.q = function(rho, v){ return 0.5*rho*v*v; };

/* ---------- airspeed relations ----------
   ASI senses dynamic pressure -> indicates IAS (~EAS, ignoring
   instrument/position error).  TAS = EAS / sqrt(sigma).         */
P.tasFromIas = function(iasMs, rho){ return iasMs*Math.sqrt(P.rho0/rho); };
P.iasFromTas = function(tasMs, rho){ return tasMs*Math.sqrt(rho/P.rho0); };

/* ============================================================
   LIFT  /  CL–alpha curve  (Auftriebsbeiwert)
   A = cA · F · ½ρv²
   Linear region slope ~0.1 /deg; smooth roll-off to cAmax at the
   critical angle of attack (kritischer Anstellwinkel), then decay.
   ============================================================ */
P.clDefaults = { clAlpha:0.10, alpha0:-3.5, clMax:1.45, alphaCrit:16 };

P.cl = function(alphaDeg, o){
  o = o || P.clDefaults;
  var a0 = o.alpha0, ac = o.alphaCrit, clmax = o.clMax, sl = o.clAlpha;
  // angle (relative to zero-lift) at which the linear extrapolation
  // would reach clMax; we round the peak over the last few degrees.
  var aPeakLin = a0 + clmax/sl;            // where linear hits clMax
  var roll = Math.min(6, aPeakLin-a0);     // rounding band width
  var aStartRoll = ac - roll;
  if(alphaDeg <= aStartRoll){
    return sl*(alphaDeg - a0);
  }
  if(alphaDeg <= ac){
    // smooth parabola joining linear value to clMax (flat top at ac)
    var clLin = sl*(aStartRoll - a0);
    var t = (alphaDeg - aStartRoll)/(ac - aStartRoll);   // 0..1
    return clLin + (clmax - clLin)*(1 - (1-t)*(1-t));
  }
  // post-stall decline
  var over = alphaDeg - ac;
  return Math.max(0.25, clmax - 0.045*over*over*0 - 0.055*over);
};
P.stalled = function(alphaDeg, o){ o=o||P.clDefaults; return alphaDeg > o.alphaCrit; };

/* lift force (N) */
P.lift = function(cl, rho, v, S){ return cl*0.5*rho*v*v*S; };

/* stall speed (m/s):  V_s = sqrt( 2·n·W / (ρ·S·cAmax) ) */
P.stallSpeed = function(W, rho, S, clMax, n){
  n = n||1;
  return Math.sqrt(2*n*W/(rho*S*clMax));
};

/* ============================================================
   DRAG  &  POLAR
   cW = cW0 + cA²/(π·Λ·e)      (Gesamtwiderstand)
   ============================================================ */
P.cd = function(cl, cd0, AR, e){ return cd0 + cl*cl/(Math.PI*AR*e); };
P.cdi = function(cl, AR, e){ return cl*cl/(Math.PI*AR*e); };
P.drag = function(cd, rho, v, S){ return cd*0.5*rho*v*v*S; };

/* speed for a given cL in steady flight (lift = weight·n) */
P.speedForCl = function(W, rho, S, cl, n){ n=n||1; return Math.sqrt(2*n*W/(rho*S*cl)); };

/* glide: sink rate for a polar point (m/s, positive down) */
P.sinkRate = function(V, cl, cd){ return V*cd/cl; };       // ROD ≈ V·(cD/cA)
P.glideRatio = function(cl, cd){ return cl/cd; };

/* ============================================================
   TURN  &  LOAD FACTOR   (Kurvenflug / Lastvielfaches)
   n = 1/cos φ ,  V_s(turn)=V_s·√n , r=V²/(g·tanφ)
   ============================================================ */
P.loadFactor = function(bankDeg){ return 1/Math.cos(P.rad(bankDeg)); };
P.turnRadius = function(V, bankDeg){
  var t = Math.tan(P.rad(bankDeg));
  return t<=0 ? Infinity : V*V/(P.g*t);
};
P.turnRate = function(V, bankDeg){          // deg per second
  var r = P.turnRadius(V, bankDeg);
  return r===Infinity ? 0 : P.deg(V/r);
};

/* ============================================================
   JOUKOWSKI  AIRFOIL  FLOW  (potential flow, Kutta condition)
   Conformal map  z = ζ + λ²/ζ  of flow past a cylinder.
   Gives genuinely correct streamlines, stagnation points,
   surface pressure (cp) and circulation (→ lift).
   ============================================================ */
function cAdd(a,b){return{re:a.re+b.re,im:a.im+b.im};}
function cSub(a,b){return{re:a.re-b.re,im:a.im-b.im};}
function cMul(a,b){return{re:a.re*b.re-a.im*b.im,im:a.re*b.im+a.im*b.re};}
function cDiv(a,b){var d=b.re*b.re+b.im*b.im;return{re:(a.re*b.re+a.im*b.im)/d,im:(a.im*b.re-a.re*b.im)/d};}
function cAbs2(a){return a.re*a.re+a.im*a.im;}
function cAbs(a){return Math.sqrt(a.re*a.re+a.im*a.im);}
function cSqrt(a){ // principal sqrt
  var r=cAbs(a), x=Math.sqrt((r+a.re)/2), y=Math.sqrt((r-a.re)/2);
  if(a.im<0) y=-y; return {re:x,im:y};
}

/* Build an airfoil mapping from camber & thickness controls.
   thickness ~ how far left the circle centre sits (-cx),
   camber    ~ how far up the centre sits (cy).               */
P.joukowski = function(opts){
  var lam = 1.0;
  var cx = -(opts.thickness!==undefined?opts.thickness:0.10);   // 0..0.2
  var cy =  (opts.camber!==undefined?opts.camber:0.06);         // 0..0.18
  var z0 = {re:cx, im:cy};
  // circle must pass through ζ = +λ (trailing-edge singularity)
  var R  = Math.hypot(lam - cx, cy);
  var beta = Math.asin(cy/R);            // camber/zero-lift angle (rad)
  var U  = 1.0;                          // freestream speed (normalised)

  function map(z){ return cAdd(z, cDiv({re:lam*lam,im:0}, z)); }   // ζ -> z
  function dzdζ(z){ return cSub({re:1,im:0}, cDiv({re:lam*lam,im:0}, cMul(z,z))); }

  return {
    lam:lam, R:R, z0:z0, beta:beta,
    map:map,
    // circulation from Kutta condition for angle of attack a (rad)
    gamma:function(a){ return 4*Math.PI*U*R*Math.sin(a+beta); },
    // lift coefficient (chord ≈ 4λ).  CL = 2πc·sin(α+β)/(...) -> standard:
    cl:function(a){ return 2*Math.PI*Math.sin(a+beta)*R/lam; },
    // complex velocity in PHYSICAL plane at physical point Z, for AoA a
    velAt:function(Z, a){
      // invert map: ζ = (z ± sqrt(z²-4λ²))/2 , pick root outside circle
      var z2 = cSub(cMul(Z,Z),{re:4*lam*lam,im:0});
      var s  = cSqrt(z2);
      var zeta = {re:(Z.re+s.re)/2, im:(Z.im+s.im)/2};
      if(cAbs(cSub(zeta,z0)) < R){ zeta = {re:(Z.re-s.re)/2, im:(Z.im-s.im)/2}; }
      // velocity in ζ-plane around cylinder
      var d = cSub(zeta, z0);
      var ea = {re:Math.cos(a), im:-Math.sin(a)};   // e^{-iα}
      var ea2= {re:Math.cos(a), im: Math.sin(a)};   // e^{+iα}
      var term2 = cMul({re:R*R,im:0}, cDiv(ea2, cMul(d,d)));
      var wζ = cSub(ea, term2);
      var g  = this.gamma(a);
      var circ= cDiv({re:0, im:g/(2*Math.PI)}, d);  // iΓ/2π /(ζ-z0)
      wζ = cAdd(wζ, circ);
      // physical velocity = conj?  use w_z = wζ / (dz/dζ); flow vel = conj(w_z)
      var dz = dzdζ(zeta);
      var wz = cDiv(wζ, dz);
      return {vx:wz.re, vy:-wz.im, zeta:zeta};       // actual velocity vector
    },
    // surface pressure distribution: returns array of {x,y,cp,upper}
    surface:function(a, n){
      n=n||120; var out=[];
      for(var i=0;i<=n;i++){
        var th = Math.PI*2*i/n;
        var zeta = {re:z0.re+R*Math.cos(th), im:z0.im+R*Math.sin(th)};
        var Z = map(zeta);
        var d = cSub(zeta,z0);
        var ea={re:Math.cos(a),im:-Math.sin(a)}, ea2={re:Math.cos(a),im:Math.sin(a)};
        var wζ = cSub(ea, cMul({re:R*R,im:0}, cDiv(ea2,cMul(d,d))));
        wζ = cAdd(wζ, cDiv({re:0,im:this.gamma(a)/(2*Math.PI)}, d));
        var dz = dzdζ(zeta);
        var speed;
        if(cAbs(dz) < 1e-4){ speed = 0; }            // trailing edge (Kutta)
        else speed = cAbs(wζ)/cAbs(dz);
        var cp = 1 - speed*speed;
        out.push({x:Z.re, y:Z.im, cp:cp, th:th});
      }
      return out;
    },
    // the airfoil outline points (for drawing the shape)
    outline:function(n){
      n=n||160; var out=[];
      for(var i=0;i<=n;i++){
        var th=Math.PI*2*i/n;
        var zeta={re:z0.re+R*Math.cos(th), im:z0.im+R*Math.sin(th)};
        out.push(map(zeta));
      }
      return out;
    }
  };
};

window.Phys = P;
})();
