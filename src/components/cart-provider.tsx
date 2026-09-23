"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
export type CartItem = {
  variantId: string;
  slug: string;
  name: string;
  image: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
};
type CartContext = {
  items: CartItem[];
  add: (item: CartItem) => void;
  update: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};
const Context = createContext<CartContext | null>(null);
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("vozeen-cart") || "[]");
      if (Array.isArray(stored))
        setItems(
          stored.filter(
            (i) =>
              typeof i.variantId === "string" &&
              Number.isInteger(i.quantity) &&
              i.quantity > 0,
          ),
        );
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem("vozeen-cart", JSON.stringify(items));
  }, [items, ready]);
  const add = (item: CartItem) =>
    setItems((prev) =>
      prev.some((i) => i.variantId === item.variantId)
        ? prev.map((i) =>
            i.variantId === item.variantId
              ? { ...i, quantity: Math.min(10, i.quantity + item.quantity) }
              : i,
          )
        : [...prev, item],
    );
  return (
    <Context.Provider
      value={{
        items,
        add,
        update: (id, qty) =>
          setItems((prev) =>
            qty <= 0
              ? prev.filter((i) => i.variantId !== id)
              : prev.map((i) =>
                  i.variantId === id
                    ? { ...i, quantity: Math.min(10, qty) }
                    : i,
                ),
          ),
        clear: () => setItems([]),
        count: items.reduce((sum, i) => sum + i.quantity, 0),
        drawerOpen,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useCart() {
  const value = useContext(Context);
  if (!value) throw new Error("Cart provider missing");
  return value;
}
