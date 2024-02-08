'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    // RELACIONES
    static associate(models) {
      // FUTURAS RELACIONES
    }
  }

  User.init(
    {
      userName: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isAlphanumeric: true,
        },
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      avatar: DataTypes.STRING,
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isBanned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      emailVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      }
    },
    {
      sequelize,
      modelName: 'User',
      // Verificar que ni el nombre ni el email sean el mismo
      hooks: {
        beforeValidate: async (user, options) => {
          const existingUserWithEmail = await User.findOne({ where: { email: user.email } });
          const existingUserWithUsername = await User.findOne({ where: { userName: user.userName } });
          if (existingUserWithUsername) {
            throw new Error('Username is already in use');
          }
          if (existingUserWithEmail) {
            throw new Error('Email is already in use');
          }
        },
      },
    }
  );

  return User;
};