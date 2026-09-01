/* Dummy Plot Camera editor — star 0 locked, knots 1..n + look arrows draggable. */
(function () {
  var START = {
    floor: [
      { x: 50, y: 82 },
      { x: 50, y: 64 },
      { x: 48, y: 46 },
      { x: 52, y: 28 }
    ],
    side: [
      { x: 18, y: 78 },
      { x: 38, y: 74 },
      { x: 58, y: 70 },
      { x: 78, y: 68 }
    ],
    lookFloor: { x: 68, y: 48 },
    lookSide: { x: 52, y: 52 }
  };

  function pct(el, clientX, clientY) {
    var r = el.getBoundingClientRect();
    return {
      x: Math.max(4, Math.min(96, ((clientX - r.left) / r.width) * 100)),
      y: Math.max(8, Math.min(94, ((clientY - r.top) / r.height) * 100))
    };
  }

  function arrowHead(x1, y1, x2, y2) {
    var dx = x2 - x1, dy = y2 - y1;
    var len = Math.hypot(dx, dy) || 1;
    var ux = dx / len, uy = dy / len;
    var reach = Math.min(11, len * 0.5);
    var ax = x1 + ux * reach;
    var ay = y1 + uy * reach;
    var px = -uy, py = ux;
    return (ax + px * 1.7) + "," + (ay + py * 1.7) + " " +
      (x1 + ux * (reach + 3.4)) + "," + (y1 + uy * (reach + 3.4)) + " " +
      (ax - px * 1.7) + "," + (ay - py * 1.7);
  }

  function drawSvg(svg, cams, look) {
    var n = cams.length;
    var parts = [];
    var d = "";
    for (var i = 0; i < n; i++) d += (i ? " L " : "M ") + cams[i].x + " " + cams[i].y;
    parts.push('<path d="' + d + '" fill="none" stroke="#7ec8ff" stroke-width="0.75" />');
    for (var j = 0; j < n; j++) {
      var c = cams[j];
      parts.push('<line x1="' + c.x + '" y1="' + c.y + '" x2="' + look.x + '" y2="' + look.y +
        '" stroke="#ff9a32" stroke-width="0.4" stroke-dasharray="1.1 0.8" />');
      var mx = c.x + (look.x - c.x) * 0.42;
      var my = c.y + (look.y - c.y) * 0.42;
      parts.push('<line x1="' + c.x + '" y1="' + c.y + '" x2="' + mx + '" y2="' + my +
        '" stroke="#4da3ff" stroke-width="0.7" />');
      parts.push('<polygon points="' + arrowHead(c.x, c.y, look.x, look.y) + '" fill="#4da3ff" />');
    }
    svg.innerHTML = parts.join("");
  }

  function place(el, p) {
    el.style.left = p.x + "%";
    el.style.top = p.y + "%";
  }

  function mount(pair) {
    var floorP = pair.querySelector('[data-view="floor"]');
    var sideP = pair.querySelector('[data-view="side"]');
    if (!floorP || !sideP) return;
    var floor = START.floor.map(function (p) { return { x: p.x, y: p.y }; });
    var side = START.side.map(function (p) { return { x: p.x, y: p.y }; });
    var lookF = { x: START.lookFloor.x, y: START.lookFloor.y };
    var lookS = { x: START.lookSide.x, y: START.lookSide.y };
    var svgF = floorP.querySelector(".rail-svg");
    var svgS = sideP.querySelector(".rail-svg");
    var n = floor.length;
    var floorCams = [];
    var sideCams = [];
    var lookElF, lookElS;

    function makeCams(panel, cams, bucket) {
      for (var i = 0; i < n; i++) {
        var el = document.createElement("div");
        el.className = "rail-cam" + (i === 0 ? " origin" : "");
        el.dataset.i = String(i);
        el.innerHTML = i === 0 ? "★<b>0</b>" : String(i);
        place(el, cams[i]);
        panel.appendChild(el);
        bucket.push(el);
      }
      var lookEl = document.createElement("div");
      lookEl.className = "rail-look";
      lookEl.title = "look-at — drag";
      panel.appendChild(lookEl);
      return lookEl;
    }

    lookElF = makeCams(floorP, floor, floorCams);
    lookElS = makeCams(sideP, side, sideCams);

    function paint() {
      for (var i = 0; i < n; i++) {
        place(floorCams[i], floor[i]);
        place(sideCams[i], side[i]);
      }
      place(lookElF, lookF);
      place(lookElS, lookS);
      drawSvg(svgF, floor, lookF);
      drawSvg(svgS, side, lookS);
      var inp = document.getElementById("look-at-xyz");
      if (inp) {
        inp.value = (-0.108 + (lookF.x - 72) * 0.012).toFixed(3) + ", " +
          (0.073 + (32 - lookS.y) * 0.008).toFixed(3) + ", " +
          (1.953 + (36 - lookF.y) * 0.02).toFixed(3);
      }
    }
    paint();

    var drag = null;
    function bind(panel, cams, look, isFloor) {
      panel.addEventListener("pointerdown", function (e) {
        var t = e.target.closest(".rail-cam, .rail-look");
        if (!t) return;
        if (t.classList.contains("origin")) return;
        e.preventDefault();
        t.setPointerCapture(e.pointerId);
        if (t.classList.contains("rail-look")) drag = { kind: "look" };
        else drag = { kind: "cam", i: Number(t.dataset.i) };
        drag.panel = panel;
        drag.isFloor = isFloor;
      });
      panel.addEventListener("pointermove", function (e) {
        if (!drag || drag.panel !== panel) return;
        var p = pct(panel, e.clientX, e.clientY);
        if (drag.kind === "look") {
          look.x = p.x;
          look.y = p.y;
          if (isFloor) lookS.x = p.x;
          else lookF.x = p.x;
        } else if (drag.i > 0) {
          cams[drag.i].x = p.x;
          cams[drag.i].y = p.y;
          if (isFloor) side[drag.i].x = p.x;
          else floor[drag.i].x = p.x;
        }
        paint();
      });
      function end() { drag = null; }
      panel.addEventListener("pointerup", end);
      panel.addEventListener("pointercancel", end);
    }
    bind(floorP, floor, lookF, true);
    bind(sideP, side, lookS, false);
  }

  document.querySelectorAll(".rail-pair").forEach(mount);
})();
