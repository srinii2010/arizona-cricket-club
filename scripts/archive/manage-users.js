require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function listUsers() {
  try {
    // Get user_roles data
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('id, user_id, role, created_at')
      .order('created_at', { ascending: false })
    
    if (rolesError) throw rolesError
    
    console.log('\n=== Current Users ===')
    if (userRoles.length === 0) {
      console.log('No user roles found in database')
      return
    }
    
    // Get user emails for each user_id
    for (const userRole of userRoles) {
      try {
        const { data: authUser, error: authError } = await supabase
          .from('auth.users')
          .select('email')
          .eq('id', userRole.user_id)
          .single()
        
        if (authError) {
          console.log(`User ID: ${userRole.user_id}`)
          console.log(`Role: ${userRole.role}`)
          console.log(`Email: Error fetching email`)
        } else {
          console.log(`Email: ${authUser.email}`)
          console.log(`Role: ${userRole.role}`)
          console.log(`User ID: ${userRole.user_id}`)
        }
        console.log(`Created: ${userRole.created_at}`)
        console.log(`Role ID: ${userRole.id}`)
        console.log('---')
      } catch (error) {
        console.log(`User ID: ${userRole.user_id}`)
        console.log(`Role: ${userRole.role}`)
        console.log(`Email: Error fetching email`)
        console.log('---')
      }
    }
  } catch (error) {
    console.error('Error listing users:', error)
  }
}

async function addUser(email, name, role = 'admin') {
  try {
    // First, get the user_id from auth.users
    const { data: authUser, error: authError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single()
    
    if (authError || !authUser) {
      console.log(`\n❌ User with email ${email} not found in auth.users table`)
      console.log('Make sure the user has signed in at least once with Google OAuth')
      return
    }
    
    // Then add to user_roles table
    const { data, error } = await supabase
      .from('user_roles')
      .insert([{
        user_id: authUser.id,
        role: role
      }])
      .select()
    
    if (error) throw error
    
    console.log(`\n✅ User role added successfully:`)
    console.log(`Email: ${email}`)
    console.log(`User ID: ${authUser.id}`)
    console.log(`Role: ${data[0].role}`)
  } catch (error) {
    console.error('Error adding user role:', error)
  }
}

async function removeUser(email) {
  try {
    // First, get the user_id from auth.users
    const { data: authUser, error: authError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single()
    
    if (authError || !authUser) {
      console.log(`\n❌ User with email ${email} not found in auth.users table`)
      return
    }
    
    // Then remove from user_roles table
    const { data, error } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', authUser.id)
      .select()
    
    if (error) throw error
    
    if (data.length === 0) {
      console.log(`\n❌ No user role found for email: ${email}`)
    } else {
      console.log(`\n✅ User role removed successfully:`)
      console.log(`Email: ${email}`)
      console.log(`User ID: ${authUser.id}`)
      console.log(`Role: ${data[0].role}`)
    }
  } catch (error) {
    console.error('Error removing user role:', error)
  }
}

async function updateUserRole(email, newRole) {
  try {
    // First, get the user_id from auth.users
    const { data: authUser, error: authError } = await supabase
      .from('auth.users')
      .select('id')
      .eq('email', email)
      .single()
    
    if (authError || !authUser) {
      console.log(`\n❌ User with email ${email} not found in auth.users table`)
      return
    }
    
    // Then update in user_roles table
    const { data, error } = await supabase
      .from('user_roles')
      .update({ role: newRole })
      .eq('user_id', authUser.id)
      .select()
    
    if (error) throw error
    
    if (data.length === 0) {
      console.log(`\n❌ No user role found for email: ${email}`)
    } else {
      console.log(`\n✅ User role updated successfully:`)
      console.log(`Email: ${email}`)
      console.log(`User ID: ${authUser.id}`)
      console.log(`New Role: ${data[0].role}`)
    }
  } catch (error) {
    console.error('Error updating user role:', error)
  }
}

// Command line interface
const command = process.argv[2]
const email = process.argv[3]
const name = process.argv[4]
const role = process.argv[5]

switch (command) {
  case 'list':
    listUsers()
    break
  case 'add':
    if (!email || !name) {
      console.log('Usage: node manage-users.js add <email> <name> [role]')
      console.log('Example: node manage-users.js add john@example.com "John Doe" admin')
      process.exit(1)
    }
    addUser(email, name, role)
    break
  case 'remove':
    if (!email) {
      console.log('Usage: node manage-users.js remove <email>')
      console.log('Example: node manage-users.js remove john@example.com')
      process.exit(1)
    }
    removeUser(email)
    break
  case 'update-role':
    if (!email || !role) {
      console.log('Usage: node manage-users.js update-role <email> <new-role>')
      console.log('Example: node manage-users.js update-role john@example.com admin')
      process.exit(1)
    }
    updateUserRole(email, role)
    break
  default:
    console.log('Arizona Cricket Club - User Management Tool')
    console.log('')
    console.log('Usage:')
    console.log('  node manage-users.js list                    - List all users')
    console.log('  node manage-users.js add <email> <name> [role] - Add a user')
    console.log('  node manage-users.js remove <email>          - Remove a user')
    console.log('  node manage-users.js update-role <email> <role> - Update user role')
    console.log('')
    console.log('Examples:')
    console.log('  node manage-users.js list')
    console.log('  node manage-users.js add john@example.com "John Doe" admin')
    console.log('  node manage-users.js remove john@example.com')
    console.log('  node manage-users.js update-role john@example.com unauthorized')
    console.log('')
    console.log('Available roles: admin, editor, viewer, unauthorized')
    break
}
