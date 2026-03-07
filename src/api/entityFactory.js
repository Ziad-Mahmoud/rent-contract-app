import {
  collection, doc, getDocs, getDoc,
  addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit as fsLimit,
} from "firebase/firestore";
import { db } from "../firebase";

// Maps every alias the pages use → real Firestore collection names
const COL = {
  owner:            "owners",
  tenant:           "tenants",
  unit:             "units",
  contract:         "contracts",
  contracts:        "contracts",
  contractTemplate: "contract_templates",
  notification:     "notifications",
};

export function createEntity(name) {
  const colName = COL[name] ?? name;
  const col = () => collection(db, colName);

  const entity = {
    /** list(sortField?, limitCount?)  — e.g. list('-created_date', 50) */
    async list(sortField, limitCount) {
      const constraints = [];
      if (sortField) {
        const desc = sortField.startsWith("-");
        constraints.push(orderBy(desc ? sortField.slice(1) : sortField, desc ? "desc" : "asc"));
      }
      if (limitCount) constraints.push(fsLimit(limitCount));
      const q = constraints.length ? query(col(), ...constraints) : col();
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    /** getAll() — legacy alias so old getAll('-created_date') calls still work */
    async getAll(sortField, limitCount) {
      return entity.list(sortField, limitCount);
    },

    async get(id) {
      const snap = await getDoc(doc(db, colName, id));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },

    async create(data) {
      const payload = { ...data, created_date: new Date().toISOString() };
      const ref = await addDoc(col(), payload);
      return { id: ref.id, ...payload };
    },

    async update(id, data) {
      await updateDoc(doc(db, colName, id), data);
      return { id, ...data };
    },

    async delete(id) {
      await deleteDoc(doc(db, colName, id));
      return { id };
    },

    async filter(filters = {}) {
      const constraints = Object.entries(filters).map(([f, v]) => where(f, "==", v));
      const snap = await getDocs(query(col(), ...constraints));
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },
  };

  /**
   * Proxy: handles the legacy Base44 chaining pattern where pages call
   * createEntity("owner").Owner.list()  or  createEntity("contract").Contract.list()
   * Any unknown property access (e.g. .Owner, .Contract) just returns the entity itself.
   */
  return new Proxy(entity, {
    get(target, prop) {
      return prop in target ? target[prop] : target;
    },
  });
}