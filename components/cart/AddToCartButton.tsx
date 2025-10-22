"use client";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

type Props = {
  productId: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
};

export default function AddToCartButton({ productId, disabled, className, children }: Props) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (disabled || isAdding) return;
    
    setIsAdding(true);
    try {
      // For now, we'll add a mock product to the cart
      // In a real implementation, you'd fetch the product details
      await addItem({
        id: productId,
        name: "Product", // This would come from product data
        price: 0, // This would come from product data
        image: "", // This would come from product data
        quantity: 1,
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || isAdding}
      className={className}
    >
      {isAdding ? "Adding..." : children}
    </button>
  );
}
