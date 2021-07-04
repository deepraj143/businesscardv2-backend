const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('templates', {
    template_id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    template_category: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'template_category',
        key: 'category_id'
      }
    },
    template_name: {
      type: DataTypes.STRING(250),
      allowNull: false
    },
    template_identity: {
      type: DataTypes.STRING(250),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'templates',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "template_id" },
        ]
      },
      {
        name: "template_category",
        using: "BTREE",
        fields: [
          { name: "template_category" },
        ]
      },
    ]
  });
};
