# CampConnect — Post Details Integration Guide

## 📁 File Structure

```
src/app/features/community/
├── community.module.ts              ← Feature module
├── community-routing.module.ts      ← Route: /community/post/:id
├── models/
│   └── post.model.ts                ← TypeScript interfaces
├── pages/
│   └── post-details/
│       ├── post-details.component.ts    ← Component logic + mock data
│       ├── post-details.component.html  ← Template
│       └── post-details.component.scss  ← Scoped styles
└── INTEGRATION.md                   ← This file
```

## 🔌 Step 1 — Register in App Routing

Add lazy-loaded route in your **app-routing.module.ts**:

```typescript
const routes: Routes = [
  // ... existing routes (marketplace, delivery, safety, etc.)

  {
    path: 'community',
    loadChildren: () =>
      import('./features/community/community.module')
        .then(m => m.CommunityModule),
  },
];
```

This registers the route: `/community/post/:id`

## 🔤 Step 2 — Add Google Fonts

Ensure these fonts are loaded in your `index.html` or `styles.scss`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:wght@600;700;800&display=swap" rel="stylesheet">
```

## 🧭 Navigation References

The component uses these router paths:

| Action                  | Route                          |
|-------------------------|--------------------------------|
| Click username/avatar   | `/community/profile/:userId`   |
| Click tagged product    | `/marketplace/product/:prodId` |
| Click report button     | `/safety/report?postId=...`    |
| Click related post      | `/community/post/:postId`      |
| Breadcrumb: Home        | `/community`                   |

These routes are **navigated to** but not **defined** by this module.
Ensure they exist in their respective feature modules.

## 🔄 Step 3 — Replace Mock Data with API

In `post-details.component.ts`, replace the `getMockPost()` call in `loadPost()`:

```typescript
private loadPost(id: string): void {
  // BEFORE (mock):
  // this.post = this.getMockPost(id);

  // AFTER (API):
  this.postService.getPostById(id).pipe(
    takeUntil(this.destroy$)
  ).subscribe({
    next: (post) => {
      this.post = post;
      if (this.post.comments[0]?.replies.length) {
        this.post.comments[0].showReplies = true;
      }
      this.cdr.markForCheck();
    },
    error: (err) => {
      console.error('Failed to load post', err);
      this.router.navigate(['/community']);
    }
  });
}
```

## ✅ What This Module Does NOT Touch

- ❌ Global navbar / header
- ❌ Marketplace module
- ❌ Delivery module
- ❌ Safety module
- ❌ Global styles / variables
- ❌ App-level state management

## 📱 Responsive Breakpoints

| Breakpoint  | Behavior                                      |
|-------------|-----------------------------------------------|
| > 768px     | Full desktop layout                           |
| ≤ 768px     | Stacked layout, hidden follow btn, compact    |
| ≤ 480px     | No carousel arrows, icon-only engage buttons  |

## 🎨 Design Tokens (Scoped)

All design tokens are defined as SCSS variables inside the component's
`.scss` file. They do NOT leak to global scope. If you want to share
tokens project-wide, extract them into a `_variables.scss` partial
and `@use` it in each component.
