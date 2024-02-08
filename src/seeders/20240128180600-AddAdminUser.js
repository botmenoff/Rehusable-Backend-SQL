'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */

    await queryInterface.bulkInsert('Users', [{
      userName: 'Administrator',
      email: 'marvenferry60@gmail.com',
      password: 'AhMqg4QNBPzVNVjlsrKE',
      avatar: 'https://ui-avatars.com/api/?name=admin&background=0D8ABC&color=fff&size=128',
      isBanned: false,
      isAdmin: true,
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
