"use client";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

type Props = {
  productId: string;
  productTitle?: string;
  productPrice?: number;
  productImage?: string;
  curatorName?: string;
  size?: string; // Informational metadata only
  color?: string; // Informational metadata only
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
};

export default function AddToCartButton({ 
  productId, 
  productTitle,
  productPrice,
  productImage,
  curatorName,
  size,
  color,
  disabled, 
  className, 
  children 
}: Props) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (disabled || isAdding) return;
    
    setIsAdding(true);
    try {
      // Add product to cart with all available metadata
      // Size and color are informational only, not required for selection
      await addItem({
        id: productId,
        name: productTitle || "Product",
        curator: curatorName || "Unknown",
        price: productPrice || 0,
        image: productImage || "",
        productId: productId,
        size: size, // Pass as metadata if available
        color: color, // Pass as metadata if available
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
