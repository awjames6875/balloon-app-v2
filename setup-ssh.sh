#!/bin/bash

# Create SSH directory with proper permissions
mkdir -p ~/.ssh && chmod 700 ~/.ssh

# Create SSH config file
cat > ~/.ssh/config << 'EOF'
Host cursor-ssh
  HostName cursor-ssh.replit.com
  User repl
  IdentityFile ~/.ssh/id_rsa
  StrictHostKeyChecking no
EOF

# Set proper permissions
chmod 600 ~/.ssh/config
chmod 600 ~/.ssh/id_rsa

# Display public key
echo "Your SSH public key (add this to Cursor):"
echo "-----------------------------------------"
cat ~/.ssh/id_rsa.pub
echo "-----------------------------------------"
echo "SSH configuration completed successfully!"