/**
 * UserDTO — shapes the public-facing user response.
 * Never exposes passwordHash or internal tokens.
 */
class UserDTO {
  constructor(user) {
    this.id         = user.id ?? user.userId;
    this.firstName  = user.firstName;
    this.lastName   = user.lastName;
    this.email      = user.email;
    this.isActive   = user.isActive;
    this.avatarPath = user.avatarPath ?? null;
    this.roles      = user.roles ?? [];
    this.createdAt  = user.createdAt;
  }

  static from(user) {
    return new UserDTO(user);
  }
}

module.exports = UserDTO;
