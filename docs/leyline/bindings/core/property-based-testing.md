---
id: property-based-testing
last_modified: '2025-06-03'
version: '0.1.0'
derived_from: testability
enforced_by: 'testing framework configuration & code review'
---
# Binding: Use Property-Based Testing to Verify System Invariants

Complement example-based tests with property-based tests that verify invariants and relationships hold across entire classes of inputs. Define properties that must always be true and let testing frameworks generate hundreds of test cases automatically to validate these constraints.

## Rationale

This binding implements our testability tenet by dramatically expanding test coverage beyond what's practical with manually written examples. Property-based testing shifts your focus from testing specific scenarios to testing fundamental properties and invariants that define correct behavior. This approach often uncovers edge cases and boundary conditions that would never occur to you when writing example-based tests, leading to more robust and reliable systems.

Think of property-based testing like a thorough quality inspector who checks not just a few sample products, but tests the entire production line against quality standards. Instead of asking "does this specific input produce this specific output?" property-based testing asks "does this function satisfy these fundamental properties for any valid input?" This broader perspective catches categories of bugs that slip through traditional testing approaches, particularly those that occur at unusual input boundaries or with unexpected input combinations.

The power of property-based testing lies in its ability to automatically explore the input space of your functions systematically. While you might test a sorting function with a few hand-picked arrays, property-based testing can verify that the function maintains the sorting property (every element is ≤ the next element) across thousands of randomly generated arrays of different sizes and contents. When a property fails, modern property-based testing frameworks use shrinking algorithms to automatically find the minimal failing case, making debugging significantly easier than with traditional random testing.

## Rule Definition

This binding establishes guidelines for when and how to apply property-based testing effectively:

- **Property Identification**: Use property-based testing for functions and systems where you can clearly articulate invariants:
  - **Mathematical Properties**: Commutativity, associativity, identity, inverse operations
  - **Data Structure Invariants**: Size relationships, ordering properties, structural constraints
  - **Business Rule Invariants**: Constraints that must hold regardless of specific input values
  - **Round-trip Properties**: Encode/decode, serialize/deserialize operations that should be reversible

- **Complementary Coverage**: Property-based tests should complement, not replace, example-based tests:
  - **Example Tests**: Verify specific scenarios, edge cases, and known business rules
  - **Property Tests**: Verify general invariants and relationships across broad input ranges
  - **Integration**: Use both approaches for comprehensive coverage of critical functionality

- **Property Design Principles**: Write properties that are:
  - **Specific**: Clearly define what relationship or constraint must hold
  - **Universal**: Apply to all valid inputs within the specified domain
  - **Testable**: Can be automatically verified with generated inputs
  - **Independent**: Don't rely on implementation details or specific algorithms

- **Input Generation Strategy**: Design input generators that:
  - **Cover Edge Cases**: Include boundary values, empty collections, null values
  - **Reflect Real Usage**: Generate inputs that resemble actual system usage patterns
  - **Scale Appropriately**: Test with various input sizes and complexity levels
  - **Maintain Validity**: Ensure generated inputs satisfy function preconditions

- **Failure Investigation**: When properties fail:
  - **Analyze Minimal Cases**: Use shrinking to understand the root cause
  - **Verify Assumptions**: Confirm your property definition is correct
  - **Fix Root Causes**: Address the underlying issue, not just the specific failing case
  - **Strengthen Properties**: Add additional properties if the failure reveals incomplete testing

## Practical Implementation

Here are concrete strategies for integrating property-based testing into your development workflow:

1. **Start with Mathematical Properties**: Begin with functions that have clear mathematical relationships, as these are easiest to express as properties. Test sorting algorithms for ordering properties, arithmetic functions for commutativity and associativity, and data transformations for reversibility. These early successes help you develop intuition for identifying properties in more complex business logic.

2. **Design Effective Generators**: Create input generators that produce realistic, diverse test data while maintaining validity constraints. Use your domain knowledge to generate data that exercises different code paths and edge conditions. Consider creating custom generators for complex business objects that maintain internal consistency while varying in meaningful ways.

3. **Express Business Invariants**: Translate business rules into testable properties. For example, "total price always equals sum of item prices plus tax" or "user permissions never grant access to restricted resources." These properties often catch bugs that occur when business rules interact in unexpected ways across different scenarios.

4. **Implement Round-trip Testing**: Use property-based testing to verify that serialization/deserialization, encoding/decoding, and other bidirectional operations are truly reversible. This approach catches subtle bugs in data transformation code that might not appear with hand-crafted examples but occur with unusual data structures or edge case values.

5. **Test State Machine Properties**: For stateful systems, define properties about valid state transitions and invariants that must hold across all states. Property-based testing can generate sequences of operations and verify that your system maintains consistency regardless of the specific sequence of state changes.

6. **Balance Performance and Coverage**: Configure property-based tests to run efficiently in your development workflow. Use fewer iterations during development and more comprehensive testing in CI environments. Consider using deterministic seeds for reproducible testing during debugging while maintaining randomness for broader coverage.

## Examples

```python
# Example using Hypothesis for Python property-based testing

from hypothesis import given, strategies as st
import hypothesis.strategies as st

# ❌ BAD: Only example-based testing for sorting function
def test_sort_examples():
    assert sort([3, 1, 2]) == [1, 2, 3]
    assert sort([]) == []
    assert sort([5]) == [5]
    # Limited coverage - only tests specific cases

# ✅ GOOD: Property-based testing verifies sorting invariants
@given(st.lists(st.integers()))
def test_sort_properties(input_list):
    result = sort(input_list)

    # Property 1: Result has same length as input
    assert len(result) == len(input_list)

    # Property 2: Result contains same elements as input
    assert sorted(result) == sorted(input_list)

    # Property 3: Result is actually sorted
    assert all(result[i] <= result[i+1] for i in range(len(result)-1))

    # Property 4: Result is idempotent (sorting sorted list doesn't change it)
    assert sort(result) == result

# Testing mathematical properties
@given(st.integers(), st.integers())
def test_addition_properties(a, b):
    # Commutativity: a + b = b + a
    assert add(a, b) == add(b, a)

    # Associativity with zero: a + 0 = a
    assert add(a, 0) == a

    # Inverse: a + (-a) = 0
    assert add(a, -a) == 0

# Testing business invariants
@given(st.lists(st.tuples(st.text(), st.decimals(min_value=0)), min_size=1))
def test_shopping_cart_properties(items):
    cart = ShoppingCart()
    for name, price in items:
        cart.add_item(name, price)

    # Property: Total always equals sum of item prices
    expected_total = sum(price for name, price in items)
    assert cart.total() == expected_total

    # Property: Item count equals number of items added
    assert cart.item_count() == len(items)

    # Property: Cart is never empty after adding items
    assert not cart.is_empty()
```

```typescript
// Example using fast-check for TypeScript property-based testing

import fc from 'fast-check';

// ❌ BAD: Limited example-based testing for URL parsing
describe('URL parsing examples', () => {
  it('parses simple URLs', () => {
    expect(parseURL('https://example.com')).toEqual({
      protocol: 'https',
      domain: 'example.com',
      path: '/'
    });
  });

  it('parses URLs with paths', () => {
    expect(parseURL('http://test.org/path')).toEqual({
      protocol: 'http',
      domain: 'test.org',
      path: '/path'
    });
  });
});

// ✅ GOOD: Property-based testing for URL handling
describe('URL parsing properties', () => {
  it('parsing and formatting are inverse operations', () => {
    fc.assert(fc.property(
      fc.webUrl(), // Built-in generator for valid URLs
      (url) => {
        const parsed = parseURL(url);
        const formatted = formatURL(parsed);

        // Round-trip property: parse(format(parse(url))) should equal parse(url)
        const reparsed = parseURL(formatted);
        expect(reparsed).toEqual(parsed);
      }
    ));
  });

  it('valid URLs always parse without throwing', () => {
    fc.assert(fc.property(
      fc.webUrl(),
      (url) => {
        // Property: Valid URLs should never cause parsing to throw
        expect(() => parseURL(url)).not.toThrow();

        const result = parseURL(url);
        // Property: Result should always have required fields
        expect(result).toHaveProperty('protocol');
        expect(result).toHaveProperty('domain');
        expect(result).toHaveProperty('path');
      }
    ));
  });
});

// Testing data transformation properties
describe('data encoding properties', () => {
  it('base64 encoding is reversible', () => {
    fc.assert(fc.property(
      fc.uint8Array(), // Generate arbitrary byte arrays
      (data) => {
        const encoded = base64Encode(data);
        const decoded = base64Decode(encoded);

        // Round-trip property
        expect(decoded).toEqual(data);

        // Property: Encoded data should be valid base64
        expect(encoded).toMatch(/^[A-Za-z0-9+/]*={0,2}$/);
      }
    ));
  });
});

// Testing state machine properties
describe('user session properties', () => {
  it('session operations maintain valid state', () => {
    fc.assert(fc.property(
      fc.array(fc.oneof(
        fc.constant('login'),
        fc.constant('logout'),
        fc.constant('refresh'),
        fc.constant('expire')
      )),
      (operations) => {
        const session = new UserSession();

        for (const operation of operations) {
          // Property: Operations should never leave session in invalid state
          switch (operation) {
            case 'login':
              if (!session.isLoggedIn()) {
                session.login('user');
              }
              break;
            case 'logout':
              if (session.isLoggedIn()) {
                session.logout();
              }
              break;
            case 'refresh':
              if (session.isLoggedIn()) {
                session.refresh();
              }
              break;
            case 'expire':
              session.expire();
              break;
          }

          // Invariant: Session state is always consistent
          if (session.isLoggedIn()) {
            expect(session.getUser()).toBeDefined();
            expect(session.getExpirationTime()).toBeGreaterThan(Date.now());
          } else {
            expect(session.getUser()).toBeNull();
          }
        }
      }
    ));
  });
});
```

```java
// Example using jqwik for Java property-based testing

import net.jqwik.api.*;

class CollectionPropertiesTest {

    // ❌ BAD: Limited example-based testing
    @Test
    void testListOperations() {
        List<Integer> list = Arrays.asList(1, 2, 3);
        assertEquals(3, list.size());
        assertTrue(list.contains(2));
    }

    // ✅ GOOD: Property-based testing for collection operations
    @Property
    void addingElementIncreasesSize(@ForAll List<@IntRange(min = 0, max = 1000) Integer> list,
                                   @ForAll @IntRange(min = 0, max = 1000) Integer element) {
        List<Integer> mutableList = new ArrayList<>(list);
        int originalSize = mutableList.size();

        mutableList.add(element);

        // Property: Adding element increases size by exactly 1
        assertEquals(originalSize + 1, mutableList.size());

        // Property: Added element is contained in the list
        assertTrue(mutableList.contains(element));

        // Property: All original elements are still present
        for (Integer original : list) {
            assertTrue(mutableList.contains(original));
        }
    }

    @Property
    void removingExistingElementDecreasesSize(@ForAll("nonEmptyIntegerLists") List<Integer> list) {
        List<Integer> mutableList = new ArrayList<>(list);
        Integer elementToRemove = list.get(0); // Take first element
        int originalSize = mutableList.size();

        boolean removed = mutableList.remove(elementToRemove);

        // Property: Removing existing element succeeds
        assertTrue(removed);

        // Property: Size decreases by exactly 1
        assertEquals(originalSize - 1, mutableList.size());

        // Property: Removed element is no longer present (unless it was duplicated)
        if (!list.subList(1, list.size()).contains(elementToRemove)) {
            assertFalse(mutableList.contains(elementToRemove));
        }
    }

    @Provide
    Arbitrary<List<Integer>> nonEmptyIntegerLists() {
        return Arbitraries.integers()
                .between(1, 100)
                .list()
                .ofMinSize(1)
                .ofMaxSize(50);
    }
}

// Testing business logic properties
class OrderProcessingPropertiesTest {

    @Property
    void orderTotalEqualsItemSum(@ForAll("validOrders") Order order) {
        BigDecimal expectedTotal = order.getItems().stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal tax = order.calculateTax();
        BigDecimal shipping = order.calculateShipping();

        // Property: Total always equals sum of items plus tax plus shipping
        BigDecimal actualTotal = order.calculateTotal();
        assertEquals(expectedTotal.add(tax).add(shipping), actualTotal);
    }

    @Property
    void applyingDiscountNeverIncreasesTotal(@ForAll("validOrders") Order order,
                                           @ForAll @BigDecimalRange(min = "0.0", max = "0.5") BigDecimal discountRate) {
        BigDecimal originalTotal = order.calculateTotal();

        Order discountedOrder = order.applyDiscount(discountRate);
        BigDecimal discountedTotal = discountedOrder.calculateTotal();

        // Property: Discount never increases total
        assertTrue(discountedTotal.compareTo(originalTotal) <= 0);

        // Property: With positive discount, total should be less
        if (discountRate.compareTo(BigDecimal.ZERO) > 0) {
            assertTrue(discountedTotal.compareTo(originalTotal) < 0);
        }
    }

    @Provide
    Arbitrary<Order> validOrders() {
        return Combine.combine(
            Arbitraries.strings().alpha().ofMinLength(1).ofMaxLength(20),
            Arbitraries.create(() -> generateValidOrderItems())
        ).as((customerId, items) -> new Order(customerId, items));
    }
}
```

## Related Bindings

- [pure-functions](../../docs/bindings/core/pure-functions.md): Pure functions are ideal candidates for property-based testing because they have no side effects and always return the same output for the same input. This predictability makes it easier to define and verify properties. When you combine pure functions with property-based testing, you create highly reliable components that are thoroughly validated across their entire input space.

- [fail-fast-validation](../../docs/bindings/core/fail-fast-validation.md): Property-based testing complements fail-fast validation by testing the validation logic itself. You can use property-based tests to verify that your validation functions correctly reject invalid inputs and accept valid ones across wide ranges of test data. This combination ensures both that invalid data is caught early and that the validation logic is comprehensive and correct.

- [no-internal-mocking](../../docs/bindings/core/no-internal-mocking.md): Property-based testing works best with real implementations rather than mocked components, aligning perfectly with the no-internal-mocking principle. When you test properties of real system behavior rather than mocked interactions, you gain confidence that your system actually works correctly. Property-based testing naturally encourages testing at appropriate boundaries with real components.
