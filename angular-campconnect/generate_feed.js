const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\marye\\OneDrive\\Desktop\\PI-campconnect\\CampConnect-main\\CampConnect-main\\premium-community-feed-design';
const destDir = 'C:\\Users\\marye\\OneDrive\\Desktop\\PI-campconnect\\CampConnect-main\\CampConnect-main\\angular-campconnect\\src\\app\\features\\community\\community-feed';

// Ensure dest dir exists
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// 1. Copy CSS
const css = fs.readFileSync(path.join(srcDir, 'styles.css'), 'utf-8');
fs.writeFileSync(path.join(destDir, 'community-feed.component.scss'), css);

// 2. Extract HTML
const html = fs.readFileSync(path.join(srcDir, 'index.html'), 'utf-8');

// Find layout
const layoutStart = html.indexOf('<div class="cc-layout">');
const layoutEnd = html.indexOf('</div><!-- /.cc-layout -->') + '</div><!-- /.cc-layout -->'.length;
let layoutHtml = html.substring(layoutStart, layoutEnd);

// Replace static posts with Angular template
const feedStart = layoutHtml.indexOf('<!-- ====== CENTER FEED ====== -->');
const centerFeedMatch = layoutHtml.match(/<main class="cc-feed"[^>]*>([\s\S]*?)<\/main>/);

if (centerFeedMatch) {
  const mainContent = centerFeedMatch[1];
  
  // Create Post box and Feed Tabs
  const createPostEnd = mainContent.indexOf('<!-- ====== POST 1');
  const topFeed = mainContent.substring(0, createPostEnd);
  
  // Mock Angular Post Template
  const ngPost = `
      <!-- Dynamic Angular Posts -->
      <article class="cc-post" *ngFor="let post of posts" [attr.aria-label]="\'Post by \' + post.user.name">
        <header class="cc-post__header" (click)="goToProfile(post.user.name)">
          <img
            [src]="post.user.avatar"
            [alt]="post.user.name"
            class="cc-post__avatar"
            style="cursor: pointer;"
          >
          <div class="cc-post__user-info" style="cursor: pointer;">
            <div class="cc-post__user-top">
              <span class="cc-post__username">{{ post.user.name }}</span>
              <span class="cc-post__badge" *ngIf="post.user.verified">
                <span class="cc-post__badge-icon">✓</span>
                Verified Camper
              </span>
            </div>
            <div class="cc-post__meta">
              <span class="cc-post__location">📍 {{ post.location }}</span>
              <span class="cc-post__meta-dot" aria-hidden="true"></span>
              <time class="cc-post__time">{{ post.timestamp }}</time>
            </div>
          </div>
          <button class="cc-post__more-btn" aria-label="More options">⋯</button>
        </header>

        <div class="cc-post__body" (click)="goToPost(post.id)" style="cursor: pointer;">
          <p class="cc-post__text" [innerHTML]="post.content"></p>
        </div>

        <figure class="cc-post__media" *ngIf="post.media" (click)="goToPost(post.id)">
          <img
            [src]="post.media"
            alt="Post image"
            class="cc-post__image"
          >
          <div class="cc-post__video-play" aria-label="Play video" *ngIf="post.videoLength">▶</div>
          <span class="cc-post__media-overlay" *ngIf="post.videoLength">🎬 {{ post.videoLength }}</span>
        </figure>

        <div class="cc-post__products" *ngIf="post.products && post.products.length > 0">
          <span class="cc-post__product-chip" *ngFor="let prod of post.products">
            <span class="cc-post__product-icon">{{ prod.icon }}</span> {{ prod.name }}
          </span>
        </div>

        <div class="cc-post__stats">
          <div class="cc-post__stats-likes">
            <span class="cc-post__stats-emoji" aria-hidden="true">
              <span>❤️</span>
            </span>
            <span>{{ post.likes }} likes</span>
          </div>
          <span>{{ post.comments.length }} comments</span>
        </div>

        <div class="cc-post__actions">
          <button class="cc-post__action-btn cc-post__action-btn--like" [class.is-liked]="post.isLiked" (click)="toggleLike(post)" aria-label="Like this post">
            <span class="cc-post__action-icon">{{ post.isLiked ? '❤️' : '♡' }}</span>
            <span>Like</span>
            <span *ngIf="post.isLiked" class="cc-like-burst"></span>
          </button>
          <button class="cc-post__action-btn cc-post__action-btn--comment" (click)="goToPost(post.id)" aria-label="Comment on this post">
            <span class="cc-post__action-icon">💬</span>
            <span>Comment</span>
          </button>
          <button class="cc-post__action-btn cc-post__action-btn--share" aria-label="Share this post">
            <span class="cc-post__action-icon">↗️</span>
            <span>Share</span>
          </button>
          <button class="cc-post__action-btn cc-post__action-btn--save" [class.is-saved]="post.saved" (click)="toggleSave(post)" aria-label="Save this post" [style.color]="post.saved ? \'#7c5cbf\' : \'\'">
            <span class="cc-post__action-icon">🔖</span>
            <span>{{ post.saved ? 'Saved' : 'Save' }}</span>
          </button>
        </div>

        <div class="cc-post__comments" *ngIf="post.comments.length > 0">
          <div class="cc-comment" *ngFor="let comment of post.comments.slice(0, 2)">
            <img
              [src]="comment.user.avatar"
              [alt]="comment.user.name"
              class="cc-comment__avatar"
            >
            <div class="cc-comment__body">
              <span class="cc-comment__name">{{ comment.user.name }}</span>
              <p class="cc-comment__text">{{ comment.text }}</p>
            </div>
          </div>
        </div>
        <button class="cc-post__view-comments" *ngIf="post.comments.length > 2" (click)="goToPost(post.id)">View all {{ post.comments.length }} comments</button>
      </article>
      
      <!-- Infinite Scroll Loading -->
      <div class="cc-loading" id="feedLoader" aria-label="Loading more posts">
        <div class="cc-loading__spinner"></div>
        <span>Loading more adventures...</span>
      </div>
  `;
  
  const newMainContent = topFeed + ngPost;
  
  layoutHtml = layoutHtml.replace(mainContent, newMainContent);
}

const finalHtml = `<div class="cc-app">\n${layoutHtml}\n</div>`;

fs.writeFileSync(path.join(destDir, 'community-feed.component.html'), finalHtml);
console.log('HTML and SCSS Generated.');
