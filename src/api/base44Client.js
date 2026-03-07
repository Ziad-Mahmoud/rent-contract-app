// ============================================================
// DROP-IN REPLACEMENT for Base44 SDK
// Same API surface as base44.entities.X — no page changes needed
// ============================================================

import {
  collection, doc, getDocs, getDoc,
  addDoc, updateDoc, deleteDoc,
  query, orderBy, limit as fsLimit,
  serverTimestamp
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";

function createEntity(collectionName) {
  const col = () => collection(db, collectionName);

  return {
    /**
     * list(sortField?, limitCount?)
     * sortField: '-created_date' for desc, 'created_date' for asc
     */
    async list(sortField, limitCount) {
      const constraints = [];

      if (sortField) {
        const isDesc = sortField.startsWith('-');
        const field = isDesc ? sortField.slice(1) : sortField;
        constraints.push(orderBy(field, isDesc ? 'desc' : 'asc'));
      }

      if (limitCount) {
        constraints.push(fsLimit(limitCount));
      }

      const q = constraints.length ? query(col(), ...constraints) : col();
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    async get(id) {
      const snap = await getDoc(doc(db, collectionName, id));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },

    async create(data) {
      const payload = {
        ...data,
        created_date: new Date().toISOString(),
      };
      const docRef = await addDoc(col(), payload);
      return { id: docRef.id, ...payload };
    },

    async update(id, data) {
      await updateDoc(doc(db, collectionName, id), data);
      return { id, ...data };
    },

    async delete(id) {
      await deleteDoc(doc(db, collectionName, id));
      return { id };
    },
  };
}

export const base44 = {
  entities: {
    Contract:         createEntity("contracts"),
    ContractTemplate: createEntity("contract_templates"),
    Notification:     createEntity("notifications"),
    Owner:            createEntity("owners"),
    Tenant:           createEntity("tenants"),
    Unit:             createEntity("units"),
  },

  // Replaces base44.integrations.Core.UploadFile used in ContractTemplates.jsx
  integrations: {
    Core: {
      async UploadFile({ file }) {
        const fileRef = ref(storage, `uploads/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        const file_url = await getDownloadURL(fileRef);
        return { file_url };
      },
    },
  },
};