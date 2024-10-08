/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `User`;

-- CreateTable
CREATE TABLE `Player` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `highScore` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlayerMonsterStatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `playerId` INTEGER NOT NULL,
    `monsterId` INTEGER NOT NULL,
    `monsterUUID` INTEGER NOT NULL,
    `monsterPosition` INTEGER NOT NULL,
    `monsterCurrentHp` INTEGER NOT NULL,

    INDEX `PlayerMonsterStatus_playerId_idx`(`playerId`),
    INDEX `PlayerMonsterStatus_monsterId_idx`(`monsterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlayerTower` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `playerId` INTEGER NOT NULL,
    `towerId` INTEGER NOT NULL,
    `towerUUID` INTEGER NOT NULL,
    `towerPosition` INTEGER NOT NULL,
    `lastAttackTime` DATETIME(3) NOT NULL,

    INDEX `PlayerTower_playerId_idx`(`playerId`),
    INDEX `PlayerTower_towerId_idx`(`towerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlayerProgress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `playerId` INTEGER NOT NULL,
    `currentStageId` INTEGER NOT NULL,
    `gold` INTEGER NOT NULL,
    `score` INTEGER NOT NULL,
    `currentHQId` INTEGER NOT NULL,
    `currentHQHp` INTEGER NOT NULL,
    `lastUpdate` DATETIME(3) NOT NULL,

    INDEX `PlayerProgress_playerId_idx`(`playerId`),
    INDEX `PlayerProgress_currentStageId_idx`(`currentStageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Monster` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `damage` INTEGER NOT NULL,
    `hp` INTEGER NOT NULL,
    `weight` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Tower` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `attackCooltime` BIGINT NOT NULL,
    `damage` INTEGER NOT NULL,
    `damageRange` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Stage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `monsterCount` INTEGER NOT NULL,
    `monsterTypeRange` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SpartaHeadQuater` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `maxHp` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PlayerMonsterStatus` ADD CONSTRAINT `PlayerMonsterStatus_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `Player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerMonsterStatus` ADD CONSTRAINT `PlayerMonsterStatus_monsterId_fkey` FOREIGN KEY (`monsterId`) REFERENCES `Monster`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerTower` ADD CONSTRAINT `PlayerTower_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `Player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerTower` ADD CONSTRAINT `PlayerTower_towerId_fkey` FOREIGN KEY (`towerId`) REFERENCES `Tower`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerProgress` ADD CONSTRAINT `PlayerProgress_playerId_fkey` FOREIGN KEY (`playerId`) REFERENCES `Player`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerProgress` ADD CONSTRAINT `PlayerProgress_currentStageId_fkey` FOREIGN KEY (`currentStageId`) REFERENCES `Stage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerProgress` ADD CONSTRAINT `PlayerProgress_currentHQId_fkey` FOREIGN KEY (`currentHQId`) REFERENCES `SpartaHeadQuater`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
