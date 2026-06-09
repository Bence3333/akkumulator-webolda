import React from "react";
import { Link } from "react-router-dom";

export default function Koszonjuk2() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center font-sans text-white bg-gradient-to-br from-blue-600 to-indigo-700">
      <div className="w-full max-w-xl p-10 rounded-2xl bg-white/15 shadow-2xl backdrop-blur-md">
        <div className="inline-block px-4 py-2 rounded-full bg-white/20 text-sm mb-5">
          Spark Solar • Kérdőív kitöltve
        </div>
        <div className="text-6xl leading-none my-5">📋</div>
        <h1 className="text-3xl font-bold mb-3">Köszönjük a kitöltést!</h1>
        <p className="text-base leading-relaxed opacity-90 mb-5">
          Válaszait sikeresen rögzítettük.
          <br />
          Amennyiben szükséges, kollégáink hamarosan felveszik Önnel a kapcsolatot.
        </p>

        <div className="mt-5 text-left bg-white/20 p-4 rounded-xl text-sm leading-relaxed">
          <b className="block mb-2">Mi történik most?</b>
          <div>1) Válaszai feldolgozásra kerülnek</div>
          <div>2) Személyre szabott megoldást dolgozunk ki</div>
          <div>3) Hamarosan jelentkezünk az eredményekkel</div>
        </div>

        <Link
          to="/"
          className="inline-block mt-8 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
        >
          Vissza a főoldalra
        </Link>
      </div>
    </div>
  );
}
