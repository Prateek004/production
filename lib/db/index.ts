// Dexie-based local database
import Dexie, { type Table } from "dexie";
import type { Order, MenuItem, MenuCategory, RawMaterial, FinishedGood } from "@/lib/types";

class ServezyDB extends Dexie {
  orders!: Table<Order, string>;
  menuItems!: Table<MenuItem, string>;
  categories!: Table<MenuCategory, string>;
  rawMaterials!: Table<RawMaterial, string>;
  finishedGoods!: Table<FinishedGood, string>;
  barItems!: Table<FinishedGood, string>;

  constructor() {
    super("servezy_db");
    this.version(1).stores({
      orders:     "id, createdAt, syncStatus",
      menuItems:  "id, categoryId",
      categories: "id, sortOrder",
    });
    this.version(2).stores({
      orders:        "id, createdAt, syncStatus",
      menuItems:     "id, categoryId",
      categories:    "id, sortOrder",
      rawMaterials:  "id, name",
      finishedGoods: "id, name, expiryDate",
    });
    this.version(3).stores({
      orders:        "id, createdAt, syncStatus",
      menuItems:     "id, categoryId",
      categories:    "id, sortOrder",
      rawMaterials:  "id, name",
      finishedGoods: "id, name, expiryDate",
      barItems:      "id, name, expiryDate",
    });
  }
}

let _db: ServezyDB | null = null;
function getDB(): ServezyDB {
  if (!_db) _db = new ServezyDB();
  return _db;
}

// ── Orders ──────────────────────────────────────────────────────────────────
export async function dbSaveOrder(order: Order): Promise<void> { await getDB().orders.put(order); }
export async function dbGetAllOrders(): Promise<Order[]> { return (await getDB().orders.orderBy("createdAt").reverse().toArray()); }
export async function dbGetTodaysOrders(): Promise<Order[]> {
  const today = new Date().toISOString().slice(0, 10);
  return (await getDB().orders.toArray()).filter((o) => o.createdAt.startsWith(today));
}
export async function dbGetPendingOrders(): Promise<Order[]> { return getDB().orders.where("syncStatus").anyOf("pending", "failed").toArray(); }
export async function dbUpdateSyncStatus(id: string, status: Order["syncStatus"]): Promise<void> { await getDB().orders.update(id, { syncStatus: status }); }

// ── Menu Items ───────────────────────────────────────────────────────────────
export async function dbSaveMenuItem(item: MenuItem): Promise<void> { await getDB().menuItems.put(item); }
export async function dbDeleteMenuItem(id: string): Promise<void> { await getDB().menuItems.delete(id); }
export async function dbGetAllMenuItems(): Promise<MenuItem[]> { return getDB().menuItems.toArray(); }
export async function dbBulkSaveMenuItems(items: MenuItem[]): Promise<void> { await getDB().menuItems.bulkPut(items); }

// ── Categories ───────────────────────────────────────────────────────────────
export async function dbSaveCategory(cat: MenuCategory): Promise<void> { await getDB().categories.put(cat); }
export async function dbDeleteCategory(id: string): Promise<void> { await getDB().categories.delete(id); }
export async function dbGetAllCategories(): Promise<MenuCategory[]> { return (await getDB().categories.orderBy("sortOrder").toArray()); }
export async function dbBulkSaveCategories(cats: MenuCategory[]): Promise<void> { await getDB().categories.bulkPut(cats); }

// ── Raw Materials ─────────────────────────────────────────────────────────────
export async function dbSaveRawMaterial(item: RawMaterial): Promise<void> { await getDB().rawMaterials.put(item); }
export async function dbDeleteRawMaterial(id: string): Promise<void> { await getDB().rawMaterials.delete(id); }
export async function dbGetAllRawMaterials(): Promise<RawMaterial[]> { return (await getDB().rawMaterials.orderBy("name").toArray()); }

// ── Finished Goods ────────────────────────────────────────────────────────────
export async function dbSaveFinishedGood(item: FinishedGood): Promise<void> { await getDB().finishedGoods.put(item); }
export async function dbDeleteFinishedGood(id: string): Promise<void> { await getDB().finishedGoods.delete(id); }
export async function dbGetAllFinishedGoods(): Promise<FinishedGood[]> { return (await getDB().finishedGoods.orderBy("name").toArray()); }

// ── Bar Items ─────────────────────────────────────────────────────────────────
export async function dbSaveBarItem(item: FinishedGood): Promise<void> { await getDB().barItems.put(item); }
export async function dbDeleteBarItem(id: string): Promise<void> { await getDB().barItems.delete(id); }
export async function dbGetAllBarItems(): Promise<FinishedGood[]> { return (await getDB().barItems.orderBy("name").toArray()); }
