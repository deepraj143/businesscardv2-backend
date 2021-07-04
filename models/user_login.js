const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('user_login', {
    user_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "user_email"
    },
    user_phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
      unique: "user_phone"
    },
    user_password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    user_status: {
      type: DataTypes.STRING(25),
      allowNull: false,
      defaultValue: "unblocked"
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    user_created: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'user_login',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "user_id" },
        ]
      },
      {
        name: "user_email",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "user_email" },
        ]
      },
      {
        name: "user_phone",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "user_phone" },
        ]
      },
    ]
  });
};
