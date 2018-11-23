const Sequelize = require("sequelize");
const path = require('path');
const fs = require('fs-extra');
const os = require('os');

var dbPath = path.join(os.homedir(),'./.mangas-common/mangas.db');

const Op = Sequelize.Op;
const db = new Sequelize('sqlite:./'+dbPath, {
    logging: false,
    operatorsAliases: {
        $and: Op.and,
        $or: Op.or,
        $eq: Op.eq,
        $gt: Op.gt,
        $lt: Op.lt,
        $lte: Op.lte,
        $like: Op.like,
        $ne: Op.not
    }
});

const Folder = db.define('folders', {
    Id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    Name: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false
    }
},
    {
        timestamps: false
    })

const File = db.define('files', {
    Id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Name: {
        type: Sequelize.STRING,
        unique: true
    },
    CurrentPage: {
        type: Sequelize.INTEGER(5).UNSIGNED,
        defaultValue: 0
    },
    Size: {
        type: Sequelize.INTEGER.UNSIGNED
    }
},
    {
        timestamps: false
    });

const FavoriteFile = db.define('favoritefiles', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    Name: {
        type: Sequelize.STRING(100),
        unique: true
    }
}, {
        timestamps: false
    });

File.belongsTo(Folder);
Folder.hasMany(File);
FavoriteFile.hasMany(File);

init = async () => {
    if (!fs.existsSync(dbPath)) {
        console.log('creating db');
        await db.sync({ logging: true });
    }
}

module.exports = {
    File,
    FavoriteFile,
    Folder,
    init,
    Op
}