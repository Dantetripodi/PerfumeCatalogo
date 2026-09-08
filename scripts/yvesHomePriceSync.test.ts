import test from "node:test";
import assert from "node:assert/strict";
import { buildPriceUpdates } from "./yvesHomePriceSyncLogic";

test("builds only changed Yves Home price updates", () => {
  const updates = buildPriceUpdates(
    [
      { name: "Black — Difusor 250ml", collection: "home", price: 16000 },
      { name: "Mini Base Deco", collection: "home", price: 10000 },
    ],
    [
      { id: 1, name: "Black — Difusor 250ml", collection: "home", price: 25000 },
      { id: 2, name: "Mini Base Deco", collection: "home", price: 10000 },
      { id: 3, name: "Good Girl", collection: "regular", price: 16000 },
      { id: 4, name: "Producto no cruzado", collection: "home", price: 9000 },
    ]
  );

  assert.deepEqual(updates, [
    { id: 1, name: "Black — Difusor 250ml", from: 25000, to: 16000 },
  ]);
});
