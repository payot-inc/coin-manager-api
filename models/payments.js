'use strict';
module.exports = (sequelize, DataTypes) => {
  const payments = sequelize.define('payments', {
    mac: DataTypes.STRING,
    amount: DataTypes.DECIMAL,

  }, {});
  payments.associate = function(models) {
    // associations can be defined here

    payments.belongsTo(models.company)

    payments.belongsTo(models.franchise)

    payments.belongsTo(models.machine)
  };
  return payments;
};