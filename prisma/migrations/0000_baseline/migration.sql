-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'CURATOR', 'BUYER');

-- CreateTable
CREATE TABLE "public"."access_codes" (
    "code" TEXT NOT NULL,
    "curatorId" TEXT NOT NULL,
    "label" TEXT,
    "maxUses" INTEGER DEFAULT 0,
    "domain" TEXT,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_codes_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "public"."cart_items" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "size" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."collaboration_requests" (
    "id" TEXT NOT NULL,
    "fromCuratorId" TEXT NOT NULL,
    "toCuratorId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "projectType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collaboration_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."collaborations" (
    "id" TEXT NOT NULL,
    "curator1Id" TEXT NOT NULL,
    "curator2Id" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "jointPageUrl" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collaborations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."curator_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "bio" TEXT,
    "bannerImage" TEXT,
    "instagram" TEXT,
    "tiktok" TEXT,
    "youtube" TEXT,
    "twitter" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isEditorsPick" BOOLEAN NOT NULL DEFAULT false,
    "notifyFollowers" BOOLEAN NOT NULL DEFAULT true,
    "notifyFavorites" BOOLEAN NOT NULL DEFAULT true,
    "notifyCollaborations" BOOLEAN NOT NULL DEFAULT true,
    "notifyOrders" BOOLEAN NOT NULL DEFAULT true,
    "showSales" BOOLEAN NOT NULL DEFAULT false,
    "showEarnings" BOOLEAN NOT NULL DEFAULT true,
    "allowCollaborations" BOOLEAN NOT NULL DEFAULT true,
    "stripeAccountId" TEXT,
    "stripeAccountStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "curator_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."favorites" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "size" TEXT,
    "color" TEXT,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."orders" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "curatorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "commission" DOUBLE PRECISION NOT NULL,
    "curatorAmount" DOUBLE PRECISION NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeTransferId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paymentMethod" TEXT,
    "paymentProof" TEXT,
    "transactionCode" TEXT,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."product_images" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "altText" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."products" (
    "id" TEXT NOT NULL,
    "curatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "category" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "sizes" TEXT NOT NULL,
    "colors" TEXT NOT NULL,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "curatorNote" TEXT,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."shipping_addresses" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,

    CONSTRAINT "shipping_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_access_grants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT,
    "curatorId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "source" TEXT DEFAULT 'invite',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_access_grants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT,
    "avatar" TEXT,
    "provider" TEXT,
    "emailVerified" TIMESTAMP(3),
    "phone" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'BUYER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_access_codes_active" ON "public"."access_codes"("isActive" ASC);

-- CreateIndex
CREATE INDEX "idx_access_codes_curator" ON "public"."access_codes"("curatorId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_userId_productId_size_color_key" ON "public"."cart_items"("userId" ASC, "productId" ASC, "size" ASC, "color" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "collaborations_curator1Id_curator2Id_key" ON "public"."collaborations"("curator1Id" ASC, "curator2Id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "curator_profiles_slug_key" ON "public"."curator_profiles"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "curator_profiles_userId_key" ON "public"."curator_profiles"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_productId_key" ON "public"."favorites"("userId" ASC, "productId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "public"."products"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "shipping_addresses_orderId_key" ON "public"."shipping_addresses"("orderId" ASC);

-- CreateIndex
CREATE INDEX "idx_user_grants_code" ON "public"."user_access_grants"("code" ASC);

-- CreateIndex
CREATE INDEX "idx_user_grants_curator" ON "public"."user_access_grants"("curatorId" ASC);

-- CreateIndex
CREATE INDEX "idx_user_grants_user" ON "public"."user_access_grants"("userId" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "user_access_grants_userId_code_key" ON "public"."user_access_grants"("userId" ASC, "code" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email" ASC);

-- AddForeignKey
ALTER TABLE "public"."access_codes" ADD CONSTRAINT "fk_access_codes_curator" FOREIGN KEY ("curatorId") REFERENCES "public"."curator_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cart_items" ADD CONSTRAINT "cart_items_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."collaboration_requests" ADD CONSTRAINT "collaboration_requests_fromCuratorId_fkey" FOREIGN KEY ("fromCuratorId") REFERENCES "public"."curator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."collaboration_requests" ADD CONSTRAINT "collaboration_requests_toCuratorId_fkey" FOREIGN KEY ("toCuratorId") REFERENCES "public"."curator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."collaborations" ADD CONSTRAINT "collaborations_curator1Id_fkey" FOREIGN KEY ("curator1Id") REFERENCES "public"."curator_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."collaborations" ADD CONSTRAINT "collaborations_curator2Id_fkey" FOREIGN KEY ("curator2Id") REFERENCES "public"."curator_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."curator_profiles" ADD CONSTRAINT "curator_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorites" ADD CONSTRAINT "favorites_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."orders" ADD CONSTRAINT "orders_curatorId_fkey" FOREIGN KEY ("curatorId") REFERENCES "public"."curator_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."product_images" ADD CONSTRAINT "product_images_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."products" ADD CONSTRAINT "products_curatorId_fkey" FOREIGN KEY ("curatorId") REFERENCES "public"."curator_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."shipping_addresses" ADD CONSTRAINT "shipping_addresses_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_access_grants" ADD CONSTRAINT "fk_grants_code" FOREIGN KEY ("code") REFERENCES "public"."access_codes"("code") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."user_access_grants" ADD CONSTRAINT "fk_grants_curator" FOREIGN KEY ("curatorId") REFERENCES "public"."curator_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "public"."user_access_grants" ADD CONSTRAINT "fk_grants_user" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

