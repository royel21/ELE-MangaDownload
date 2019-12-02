-- SQLite
 SELECT `files`.`Id`, `files`.`Name`, `files`.`Current`, `files`.`Total`, `files`.`Size`, `files`.`folderId`, `files`.`favoritefileId`, 
 REPLACE(`files`.`Name`, '[', '0') AS `N`, `folder`.`Id` AS 
 `folder.Id`, `folder`.`Name` AS 
 `folder.Name`, `folder`.`folderId` AS 
 `folder.folderId`, `folder`.`favoritefileId` AS 
 `folder.favoritefileId` FROM `files` AS 
 `files` LEFT OUTER JOIN `folders` AS 
 `folder` ON `files`.`folderId` = `folder`.`Id` 
 WHERE `files`.`Name` LIKE '%%' ORDER BY `N` LIMIT 0, 500;