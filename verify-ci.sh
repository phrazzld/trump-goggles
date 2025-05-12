#!/bin/bash

# verify-ci.sh - Local CI verification script
# This script runs the same checks as the CI pipeline to ensure your changes
# will pass CI before pushing.

# Set colors for better readability
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== Trump Goggles CI Verification =====${NC}"
echo "Running checks to verify CI compliance..."
echo

# Step 1: Run linting
echo -e "${YELLOW}Running ESLint check...${NC}"
pnpm lint
LINT_STATUS=$?
if [ $LINT_STATUS -eq 0 ]; then
  echo -e "${GREEN}✓ Linting passed${NC}"
else
  echo -e "${RED}✗ Linting failed${NC}"
fi
echo

# Step 2: Run TypeScript checks
echo -e "${YELLOW}Running TypeScript check...${NC}"
pnpm typecheck
TYPECHECK_STATUS=$?
if [ $TYPECHECK_STATUS -eq 0 ]; then
  echo -e "${GREEN}✓ TypeScript check passed${NC}"
else
  echo -e "${RED}✗ TypeScript check failed${NC}"
fi
echo

# Step 3: Run tests
echo -e "${YELLOW}Running tests...${NC}"
pnpm test
TEST_STATUS=$?
if [ $TEST_STATUS -eq 0 ]; then
  echo -e "${GREEN}✓ Tests passed${NC}"
else
  echo -e "${RED}✗ Tests failed${NC}"
fi
echo

# Step 4: Run test coverage (optional, but good to check)
echo -e "${YELLOW}Running test coverage...${NC}"
pnpm test:coverage
COVERAGE_STATUS=$?
if [ $COVERAGE_STATUS -eq 0 ]; then
  echo -e "${GREEN}✓ Test coverage passed${NC}"
else
  echo -e "${RED}✗ Test coverage failed${NC}"
fi
echo

# Summary
echo -e "${YELLOW}===== Verification Results =====${NC}"
if [ $LINT_STATUS -eq 0 ] && [ $TYPECHECK_STATUS -eq 0 ] && [ $TEST_STATUS -eq 0 ]; then
  echo -e "${GREEN}All CI checks passed! Your changes should pass CI.${NC}"
  echo "It's safe to push your changes."
  exit 0
else
  echo -e "${RED}Some CI checks failed. Please fix the issues before pushing.${NC}"
  echo -e "Failed checks:"
  [ $LINT_STATUS -ne 0 ] && echo -e "${RED}  ✗ Linting${NC}"
  [ $TYPECHECK_STATUS -ne 0 ] && echo -e "${RED}  ✗ TypeScript${NC}"
  [ $TEST_STATUS -ne 0 ] && echo -e "${RED}  ✗ Tests${NC}"
  [ $COVERAGE_STATUS -ne 0 ] && echo -e "${RED}  ✗ Test coverage${NC}"
  exit 1
fi