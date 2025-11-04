#!/bin/bash

# ============================================
# Docker Build Script for Google Calendar Clone
# ============================================

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Google Calendar Clone - Docker Build${NC}"
echo -e "${GREEN}============================================${NC}\n"

# Check if Docker is running
echo -e "${YELLOW}Checking Docker...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running. Please start Docker Desktop.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}\n"

# Check if .env.local exists
echo -e "${YELLOW}Checking environment file...${NC}"
if [ ! -f .env.local ]; then
    echo -e "${RED}Error: .env.local file not found!${NC}"
    echo -e "${YELLOW}Please create .env.local file with required variables.${NC}"
    echo -e "${YELLOW}You can copy from .env.example:${NC}"
    echo -e "  cp .env.example .env.local"
    echo -e "\nThen edit .env.local with your credentials."
    exit 1
fi
echo -e "${GREEN}✓ Found .env.local${NC}\n"

# Load environment variables
source .env.local

# Check required variables
echo -e "${YELLOW}Validating environment variables...${NC}"
MISSING_VARS=()

if [ -z "$NEXTAUTH_SECRET" ]; then
    MISSING_VARS+=("NEXTAUTH_SECRET")
fi

if [ -z "$GOOGLE_CLIENT_ID" ]; then
    MISSING_VARS+=("GOOGLE_CLIENT_ID")
fi

if [ -z "$GOOGLE_CLIENT_SECRET" ]; then
    MISSING_VARS+=("GOOGLE_CLIENT_SECRET")
fi

if [ ${#MISSING_VARS[@]} -ne 0 ]; then
    echo -e "${RED}Error: Missing required environment variables:${NC}"
    for var in "${MISSING_VARS[@]}"; do
        echo -e "  - $var"
    done
    echo -e "\n${YELLOW}Please update your .env.local file.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ All required variables are set${NC}\n"

# Build with docker-compose
echo -e "${YELLOW}Building Docker images...${NC}"
echo -e "${YELLOW}This may take 5-10 minutes on first build...${NC}\n"

docker-compose build --no-cache

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}============================================${NC}"
    echo -e "${GREEN}✓ Build completed successfully!${NC}"
    echo -e "${GREEN}============================================${NC}\n"
    
    echo -e "${YELLOW}Next steps:${NC}"
    echo -e "1. Start the application:"
    echo -e "   ${GREEN}docker-compose up -d${NC}"
    echo -e ""
    echo -e "2. View logs:"
    echo -e "   ${GREEN}docker-compose logs -f${NC}"
    echo -e ""
    echo -e "3. Open browser:"
    echo -e "   ${GREEN}http://localhost:3000${NC}"
    echo -e ""
    echo -e "4. Stop the application:"
    echo -e "   ${GREEN}docker-compose down${NC}"
    echo -e ""
else
    echo -e "\n${RED}============================================${NC}"
    echo -e "${RED}✗ Build failed!${NC}"
    echo -e "${RED}============================================${NC}\n"
    exit 1
fi