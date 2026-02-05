/*
  Warnings:

  - You are about to drop the column `password` on the `user` table. All the data in the column will be lost.
  - Added the required column `passwordHash` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `post` DROP FOREIGN KEY `Post_authorId_fkey`;

-- AlterTable
ALTER TABLE `category` MODIFY `description` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `post` MODIFY `excerpt` LONGTEXT NULL,
    MODIFY `content` LONGTEXT NOT NULL,
    MODIFY `thumbnail` LONGTEXT NULL,
    MODIFY `tags` LONGTEXT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `password`,
    ADD COLUMN `passwordHash` VARCHAR(255) NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `email` VARCHAR(191) NULL,
    MODIFY `bio` LONGTEXT NULL,
    MODIFY `avatar` LONGTEXT NULL,
    MODIFY `role` ENUM('ADMIN', 'EDITOR', 'AUTHOR', 'CONTRIBUTOR', 'SUBSCRIBER') NOT NULL DEFAULT 'AUTHOR';

-- CreateIndex
CREATE INDEX `Post_status_idx` ON `Post`(`status`);

-- CreateIndex
CREATE INDEX `Post_publishedAt_idx` ON `Post`(`publishedAt`);

-- CreateIndex
CREATE INDEX `User_role_idx` ON `User`(`role`);

-- CreateIndex
CREATE INDEX `User_createdAt_idx` ON `User`(`createdAt`);

-- AddForeignKey
ALTER TABLE `Post` ADD CONSTRAINT `Post_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RedefineIndex
CREATE INDEX `Category_parentId_idx` ON `Category`(`parentId`);
DROP INDEX `Category_parentId_fkey` ON `category`;

-- RedefineIndex
CREATE INDEX `Post_authorId_idx` ON `Post`(`authorId`);
DROP INDEX `Post_authorId_fkey` ON `post`;

-- RedefineIndex
CREATE INDEX `Post_categoryId_idx` ON `Post`(`categoryId`);
DROP INDEX `Post_categoryId_fkey` ON `post`;
