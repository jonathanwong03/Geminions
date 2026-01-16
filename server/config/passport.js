const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
const supabase = require('../utils/supabaseClient');
const bcrypt = require('bcrypt');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  done(error, data);
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    proxy: true 
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
      let { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('google_id', profile.id)
        .single();
      
      if (!user) {
          // Check by email to avoid duplicates
          const { data: userByEmail } = await supabase
            .from('users')
            .select('*')
            .eq('email', profile.emails[0].value)
            .single();

          if (userByEmail) {
             const { data: updated, error: updateError } = await supabase
                .from('users')
                .update({ google_id: profile.id })
                .eq('id', userByEmail.id)
                .select()
                .single();
             return done(updateError, updated);
          }

        const newUser = {
          google_id: profile.id,
          email: profile.emails[0].value,
          username: profile.displayName
        };
        
        const { data, error: insertError } = await supabase
          .from('users')
          .insert([newUser])
          .select()
          .single();
          
        if (insertError) return done(insertError, null);
        user = data;
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  async function(email, password, done) {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user) {
        return done(null, false, { message: 'Incorrect email.' });
      }
      
      if (!user.password) {
          return done(null, false, { message: 'Please log in with Google.' });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

module.exports = passport;
