const { supabaseAdmin } = require('../config/supabase');

// @desc    Get user profile
// @route   GET /api/users/me
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, name, email, isSeller')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
exports.updateUserProfile = async (req, res) => {
  const { name, email } = req.body;

  try {
    let { data: user, error: findError } = await supabaseAdmin
      .from('users')
      .select('id, name, email')
      .eq('id', req.user.id)
      .single();

    if (findError) throw findError;

    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Check if new email already exists for another user
    if (email && email !== user.email) {
      const { data: existingUser, error: existingUserError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUserError && existingUserError.code !== 'PGRST116') throw existingUserError; // PGRST116 means no rows found

      if (existingUser) {
        return res.status(400).json({ msg: 'Email already in use' });
      }
    }

    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;

    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('users')
      .update(updateFields)
      .eq('id', req.user.id)
      .select('id, name, email, isSeller')
      .single();

    if (updateError) throw updateError;

    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};