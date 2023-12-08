const passport = require("passport");
const passportJWT = require("passport-jwt");
const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;
const User = require("../models/User");

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.TOP_SECRET,
};

const strategy = new JwtStrategy(jwtOptions, async (jwtPayload, next) => {
  try {
    const user = await User.findById(jwtPayload.sub);

    if (user) {
      return next(null, user);
    } else {
      return next(null, false);
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return next(error, false);
  }
});

passport.use(strategy);

module.exports = {
  initialize: () => passport.initialize(),
  authenticate: () => passport.authenticate("jwt", { session: false }),
};
