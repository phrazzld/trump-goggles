---
derived_from: modularity
enforced_by: Code review, Storybook organization
id: component-architecture
last_modified: '2025-05-14'
---
# Binding: Component Architecture

Structure UI components using Atomic Design principles, organizing elements into a
hierarchical system of atoms, molecules, organisms, templates, and pages with clear
responsibilities and well-defined interfaces.

## Rationale

This binding directly implements our modularity tenet by establishing a systematic
approach to frontend component organization. User interfaces are inherently complex,
combining hundreds of interactive elements that must work in harmony. Without a
structured approach to breaking down this complexity, UI code quickly becomes tangled,
brittle, and resistant to change.

Atomic Design provides a mental model borrowed from chemistry—just as all matter
consists of atoms combined into increasingly complex structures, our interfaces are
built from simple components combined into progressively more elaborate systems. This
creates a shared vocabulary that helps teams think about components at the appropriate
level of abstraction. When everyone understands the difference between an atom (like a
button) and an organism (like a navigation bar), communication becomes clearer, and
components are more likely to be built with the right scope and responsibility.

Well-designed component architecture delivers significant business value by enabling
faster development cycles and a consistent user experience. Teams can work in parallel
on different components, reuse existing elements across features, and implement design
changes systematically rather than hunting through code for every instance of a pattern.
Think of a component library as a set of standardized building blocks—like LEGO bricks
that snap together in predictable ways—rather than custom-cutting every piece of your UI
from raw materials each time.

## Rule Definition

The component architecture binding establishes these core requirements:

- **Use Atomic Design Hierarchy**: Structure UI components according to the five levels
  of Atomic Design:

  - **Atoms**: Basic UI building blocks that can't be broken down further (buttons,
    inputs, icons)
  - **Molecules**: Simple combinations of atoms functioning together as a unit (search
    bars, form fields with labels)
  - **Organisms**: Complex UI sections formed by combining molecules (navigation menus,
    forms, content cards)
  - **Templates**: Page-level structural components defining content areas without
    specific content
  - **Pages**: Specific instances of templates populated with actual content

- **Single Responsibility**: Each component should do exactly one thing and do it well.
  Avoid components that handle multiple unrelated concerns.

- **Clear Component Interfaces**: Define explicit props for component inputs, including
  proper TypeScript types, default values, and required vs. optional props.

- **Composition Over Configuration**: Prefer composing smaller components rather than
  building complex, highly configurable components with numerous props and conditional
  logic.

- **Separation of Concerns**: Separate presentational aspects (how things look) from
  container aspects (how things work) for organisms and larger components when
  appropriate.

- **Component Discoverability**: Structure your component library for maximum
  discoverability, with consistent naming and organization that makes it intuitive to
  find the right component.

In rare cases, exceptions to these rules may be necessary:

- Legacy code integration might require temporary hybrid approaches while migrating
- Third-party components may not perfectly align with Atomic Design principles
- Performance-critical components might need special optimization that affects their
  structure

Such exceptions should be clearly documented and contained to the smallest possible
scope.

## Practical Implementation

1. **Set Up Project Structure**: Organize your components folder to reflect the Atomic
   Design hierarchy:

```
src/
  components/
    atoms/
      Button/
      Input/
      Typography/
    molecules/
      FormField/
      SearchBar/
      MenuItem/
    organisms/
      Navbar/
      UserProfile/
      ProductCard/
    templates/
      DashboardLayout/
      ProductDetailLayout/
    pages/
      Dashboard/
      ProductDetail/
```

2. **Start Small and Build Up**: Begin your component library with a set of
   well-designed atoms that form the foundation of your UI:

   - Create a comprehensive set of primitive UI components (buttons, inputs, typography)
   - Ensure atoms are highly reusable and follow your design system specifications
   - Build thorough documentation and Storybook stories for each atom
   - Implement proper accessibility features at the atomic level

1. **Define Clear Component Interfaces**: Create well-defined props for every component:

   - Use TypeScript interfaces to document all props and their types
   - Make interfaces explicit about what is required vs. optional
   - Include JSDoc comments explaining the purpose of each prop
   - Consider using prop validation libraries for runtime validation

1. **Implement Effective Composition Patterns**: Design components to be combined in
   predictable ways:

   - Use React's children prop for simple composition
   - Implement the Compound Component pattern for related component sets
   - Use React Context for component communication within a hierarchy
   - Consider the Slot pattern for flexible content placement

1. **Document the Component Library**: Make your component system discoverable and
   usable:

   - Implement comprehensive Storybook documentation
   - Create usage examples for each component
   - Document component composition patterns
   - Generate a visual inventory of all available components

## Examples

```jsx
// ❌ BAD: Monolithic component with multiple responsibilities
function UserCard({ user, onEdit, onDelete, expanded, onToggleExpand }) {
  return (
    <div className="card">
      <img src={user.avatar} alt={user.name} className="avatar" />
      <div className="info">
        <h3>{user.name}</h3>
        <p>{user.email}</p>
        {expanded && (
          <>
            <p>{user.bio}</p>
            <p>Member since: {user.joinDate}</p>
          </>
        )}
      </div>
      <div className="actions">
        <button onClick={onToggleExpand}>{expanded ? 'Show Less' : 'Show More'}</button>
        <button onClick={onEdit}>Edit</button>
        <button onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}

// ✅ GOOD: Atomic design with clear component hierarchy and composition
// Atom
function Avatar({ src, alt, size = 'md' }) {
  return <img src={src} alt={alt} className={`avatar avatar-${size}`} />;
}

// Atom
function Button({ children, variant = 'primary', onClick }) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}

// Molecule
function UserInfo({ name, email }) {
  return (
    <div className="user-info">
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  );
}

// Molecule
function UserActions({ onEdit, onDelete, expanded, onToggleExpand }) {
  return (
    <div className="actions">
      <Button onClick={onToggleExpand}>{expanded ? 'Show Less' : 'Show More'}</Button>
      <Button variant="secondary" onClick={onEdit}>Edit</Button>
      <Button variant="danger" onClick={onDelete}>Delete</Button>
    </div>
  );
}

// Organism
function UserCard({ user, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card">
      <Avatar src={user.avatar} alt={user.name} />
      <UserInfo name={user.name} email={user.email} />
      {expanded && (
        <div className="user-details">
          <p>{user.bio}</p>
          <p>Member since: {user.joinDate}</p>
        </div>
      )}
      <UserActions
        onEdit={onEdit}
        onDelete={onDelete}
        expanded={expanded}
        onToggleExpand={() => setExpanded(!expanded)}
      />
    </div>
  );
}
```

```jsx
// ❌ BAD: Overly complex component with many props and conditional logic
function Button({
  children,
  size,
  color,
  variant,
  rounded,
  outlined,
  disabled,
  loading,
  icon,
  iconPosition,
  fullWidth,
  onClick,
  style,
  className,
  ...props
}) {
  let buttonClass = 'btn';
  buttonClass += ` btn-${size}`;
  buttonClass += ` btn-${color}`;
  buttonClass += ` btn-${variant}`;
  if (rounded) buttonClass += ' btn-rounded';
  if (outlined) buttonClass += ' btn-outlined';
  if (fullWidth) buttonClass += ' btn-fullWidth';
  if (className) buttonClass += ` ${className}`;

  return (
    <button
      className={buttonClass}
      disabled={disabled || loading}
      onClick={onClick}
      style={style}
      {...props}
    >
      {loading && <Spinner />}
      {icon && iconPosition === 'left' && <Icon name={icon} />}
      {children}
      {icon && iconPosition === 'right' && <Icon name={icon} />}
    </button>
  );
}

// ✅ GOOD: Composition-based approach with specialized components
// Base Button atom
function Button({ children, disabled, onClick, className, ...props }) {
  return (
    <button
      className={`btn ${className || ''}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}

// Specialized button variants built through composition
function PrimaryButton(props) {
  return <Button className="btn-primary" {...props} />;
}

function SecondaryButton(props) {
  return <Button className="btn-secondary" {...props} />;
}

function IconButton({ icon, children, iconPosition = 'left', ...props }) {
  return (
    <Button {...props}>
      {iconPosition === 'left' && <Icon name={icon} />}
      {children}
      {iconPosition === 'right' && <Icon name={icon} />}
    </Button>
  );
}

function LoadingButton({ loading, children, ...props }) {
  return (
    <Button disabled={loading} {...props}>
      {loading ? <Spinner /> : children}
    </Button>
  );
}
```

```jsx
// ❌ BAD: Form with tight coupling between presentation and logic
function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const newErrors = {};
    if (!name) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Email is invalid';
    if (!message) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await submitContactForm({ name, email, message });
      alert('Form submitted successfully!');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      alert('Error submitting form: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={errors.message ? 'error' : ''}
        />
        {errors.message && <span className="error-message">{errors.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}

// ✅ GOOD: Separation of concerns with atomic components
// Atom
function Input({ id, label, error, ...props }) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className={error ? 'input-error' : 'input'}
        {...props}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

// Atom
function TextArea({ id, label, error, ...props }) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <textarea
        id={id}
        className={error ? 'textarea-error' : 'textarea'}
        {...props}
      />
      {error && <span className="error-text">{error}</span>}
    </div>
  );
}

// Organism (with React Hook Form for logic)
function ContactForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm();

  const onSubmit = async (data) => {
    try {
      await submitContactForm(data);
      toast.success('Form submitted successfully!');
      reset();
    } catch (error) {
      toast.error('Error submitting form: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        id="name"
        label="Name"
        error={errors.name?.message}
        {...register('name', { required: 'Name is required' })}
      />

      <Input
        id="email"
        type="email"
        label="Email"
        error={errors.email?.message}
        {...register('email', {
          required: 'Email is required',
          pattern: {
            value: /^\S+@\S+\.\S+$/,
            message: 'Email is invalid'
          }
        })}
      />

      <TextArea
        id="message"
        label="Message"
        error={errors.message?.message}
        rows={5}
        {...register('message', { required: 'Message is required' })}
      />

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>
    </form>
  );
}
```

## Related Bindings

- [../tenets/modularity.md](../../docs/tenets/modularity.md): This binding directly implements
  the modularity tenet through the systematic breakdown of UI into composable
  components. While the tenet describes the general principle of dividing systems into
  independent, reusable modules, this binding provides the specific pattern for
  achieving modularity in frontend applications.

- [frontend-state-management.md](../../docs/bindings/categories/frontend/state-management.md): Complements component
  architecture by defining how state should be organized within and between components.
  Together, these bindings create a complete picture of component structure
  (architecture) and behavior (state).

- [dependency-inversion.md](../../docs/bindings/core/dependency-inversion.md): Reinforces component architecture
  by promoting loose coupling between components. Well-designed component interfaces
  follow dependency inversion principles by depending on abstractions rather than
  concrete implementations.

- [code-size.md](../../docs/bindings/core/code-size.md): Supports component architecture by encouraging small,
  focused components. The atomic design approach naturally leads to smaller, more
  manageable components with clear boundaries and responsibilities.
