# TypeScript & React Coding Standards

Essential conventions for the Launch frontend. Strict typing, modern React patterns, minimal escape hatches.

---

## Type Safety (Strict Mode Always)

### TypeScript strict in `tsconfig.json`

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### No escape hatches

```typescript
// Never
const data: any = fetchSomething();
// @ts-ignore
const result = thing.method();
// @ts-expect-error
const value = otherThing();

// Correct — type it properly
const data: Launch = await fetchLaunch(id);
```

- No `any`. If the type is truly unknown, use `unknown` and narrow it.
- No `@ts-ignore` or `@ts-expect-error`.
- No non-null assertions (`!`) unless the surrounding code makes it provably safe.

---

## Types, Not Interfaces

Prefer `type` over `interface` by default.

```typescript
// Default — use type
type Launch = {
  id: string;
  name: string;
  target_launch_date: string;
  launch_window_days: number;
  status: LaunchStatus;
};

type LaunchStatus = "draft" | "active" | "at_risk" | "ready" | "launched" | "deferred" | "cancelled";
```

Use `interface` only when you need declaration merging or when defining a contract that third-party code will implement. If neither applies, use `type`.

---

## React Components

### Function declarations only

Use function declarations for components. No class components, no `React.FC`, no arrow-function components.

```typescript
// Correct
type LaunchCardProps = {
  launch: Launch;
  onSelect: (id: string) => void;
};

function LaunchCard({ launch, onSelect }: LaunchCardProps) {
  return (
    <div onClick={() => onSelect(launch.id)}>
      <h3>{launch.name}</h3>
    </div>
  );
}
```

```typescript
// Never — class components
class LaunchCard extends React.Component { ... }

// Never — React.FC
const LaunchCard: React.FC<Props> = ({ launch }) => { ... };

// Avoid — arrow function components (anonymous in stack traces)
const LaunchCard = ({ launch }: LaunchCardProps) => { ... };
```

### Props typing

Define a `type` for props next to the component. Destructure props in the function signature.

---

## State Management: TanStack Query

Use [TanStack Query](https://tanstack.com/query) (React Query) for all server state.

```typescript
const useLaunches = () => {
  return useQuery({
    queryKey: ["launches"],
    queryFn: fetchLaunches,
  });
};

const useCreateItem = (launchId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (item: CreateItemRequest) => createItem(launchId, item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["launches", launchId, "items"] });
    },
  });
};
```

- Server state (API data) → TanStack Query
- UI-only state (open/closed, selected tab) → `useState`
- No Redux, no Zustand, no Context for server state

---

## useEffect: Escape Hatch Only

`useEffect` is for synchronizing with external systems. It is not a general-purpose lifecycle hook.

### Valid uses

- Subscribing to a browser API (resize observer, intersection observer, event listener)
- Synchronizing with a third-party DOM library
- Setting up a WebSocket connection

### Not valid uses

```typescript
// Never — deriving state in useEffect
const [filteredItems, setFilteredItems] = useState<Item[]>([]);
useEffect(() => {
  setFilteredItems(items.filter(i => i.status === selectedStatus));
}, [items, selectedStatus]);

// Correct — derive during render
const filteredItems = items.filter(i => i.status === selectedStatus);

// Or useMemo if the computation is expensive
const filteredItems = useMemo(
  () => items.filter(i => i.status === selectedStatus),
  [items, selectedStatus],
);
```

```typescript
// Never — fetching data in useEffect
useEffect(() => {
  fetch("/api/launches").then(r => r.json()).then(setLaunches);
}, []);

// Correct — use TanStack Query
const { data: launches } = useQuery({
  queryKey: ["launches"],
  queryFn: fetchLaunches,
});
```

If you reach for `useEffect`, ask: can this be derived during render, handled by TanStack Query, or moved to an event handler? If yes, don't use `useEffect`.

---

## UI Components: shadcn/ui

Use [shadcn/ui](https://ui.shadcn.com/) for reusable UI primitives. Built on Radix UI, styled with Tailwind CSS.

### Rules

- Use shadcn/ui components for all standard UI elements (Button, Card, Dialog, Table, Badge, Input, Select, Tabs, etc.).
- Do not build custom versions of components that shadcn/ui already provides.
- shadcn components live in `src/components/ui/` — do not modify them unless extending behavior.
- Application-specific components compose shadcn/ui primitives.
- Use Tailwind utility classes for layout, spacing, and color.
- Use [Lucide React](https://lucide.dev/) for icons.
- Use `cn()` from `lib/utils` for conditional class merging.

### Adding a component

```bash
npx shadcn@latest add button
npx shadcn@latest add card dialog table badge
```

### Example: composing shadcn components

```typescript
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket } from "lucide-react";

function LaunchCard({ launch, onSelect }: LaunchCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md" onClick={() => onSelect(launch.id)}>
      <CardHeader>
        <CardTitle>{launch.name}</CardTitle>
        <Badge variant={statusVariant(launch.status)}>
          {launch.status}
        </Badge>
      </CardHeader>
      <CardContent>
        {/* ... */}
      </CardContent>
    </Card>
  );
}
```

---

## Formatting & Linting

TBD — will be configured during frontend scaffolding (likely ESLint + Prettier or Biome).

---

## Pre-commit Checklist

Before submitting frontend code:

- [ ] Types: No `any`, no `@ts-ignore`, no non-null assertions without justification
- [ ] Components: Function components with typed props
- [ ] State: Server state uses TanStack Query, not useEffect + useState
- [ ] Effects: No useEffect for derived state or data fetching
- [ ] Lint: Linter passes with no warnings
- [ ] Type check: `tsc --noEmit` passes
