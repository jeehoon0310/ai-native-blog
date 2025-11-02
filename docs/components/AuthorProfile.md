# AuthorProfile 컴포넌트

## 개요

`AuthorProfile`은 블로그 포스트의 저자 정보를 표시하는 React 컴포넌트입니다. 저자의 프로필 사진, 이름, 소개, 소셜 미디어 링크를 통합적으로 보여주며, 접근성과 사용자 경험을 고려하여 설계되었습니다.

이 컴포넌트는 블로그 포스트 하단에 저자 정보를 표시하는 목적으로 사용되며, Next.js의 `Image`와 `Link` 컴포넌트를 활용하여 최적화된 성능을 제공합니다.

## 최근 리팩토링 개선사항

### 타입 안정성 강화

**SocialPlatform 타입 추가**
```typescript
type SocialPlatform = keyof NonNullable<AuthorInfo['social']>
```
- AuthorInfo['social'] 객체의 키를 추출하여 타입 안정성을 보장
- 컴파일 타임에 잘못된 플랫폼 참조 방지

### 중앙화된 설정 관리

**SOCIAL_PLATFORM_CONFIG 상수 추가**
```typescript
const SOCIAL_PLATFORM_CONFIG: Record<
  SocialPlatform,
  { label: string; ariaLabel: string }
> = {
  github: { label: 'GitHub', ariaLabel: 'GitHub 프로필 방문' },
  twitter: { label: 'Twitter', ariaLabel: 'Twitter 프로필 방문' },
  linkedin: { label: 'LinkedIn', ariaLabel: 'LinkedIn 프로필 방문' },
  website: { label: 'Website', ariaLabel: '개인 웹사이트 방문' },
} as const
```

**장점**:
- DRY 원칙 준수: 레이블과 aria-label 중복 제거
- 유지보수성 향상: 새 플랫폼 추가 시 한 곳만 수정
- 타입 안정성: SocialPlatform 타입과 연동하여 오타 방지

### 코드 간결성 개선

**AuthorName 컴포넌트의 className 로직 개선**
```typescript
// 개선 전
const nameClassName = authorSlug
  ? `${STYLES.authorNameBase} ${STYLES.authorNameHover}`
  : STYLES.authorNameBase

// 개선 후
const className = [STYLES.authorNameBase, authorSlug && STYLES.authorNameHover]
  .filter(Boolean)
  .join(' ')
```
- 더 선언적이고 함수형 프로그래밍 스타일
- 조건부 클래스 추가가 명확하고 확장 가능

**SocialLinks 컴포넌트의 로직 개선**
```typescript
// 개선 후: 설정 기반 접근
const socialLinks = (Object.keys(SOCIAL_PLATFORM_CONFIG) as SocialPlatform[])
  .filter((platform) => social[platform])
  .map((platform): SocialLink => {
    const config = SOCIAL_PLATFORM_CONFIG[platform]
    return {
      href: social[platform]!,
      label: config.label,
      ariaLabel: config.ariaLabel,
    }
  })
```
- 반복적인 객체 생성 제거
- 설정 기반으로 새 플랫폼 추가가 용이
- 타입 안정성 보장

### 코드 구조 개선

```typescript
// Types
type AuthorProfileProps = ...
type SocialLink = ...
type SocialPlatform = ...

// Constants
const AVATAR_SIZE = 64
const STYLES = { ... }
const SOCIAL_PLATFORM_CONFIG = { ... }

// Components
function AuthorAvatar() { ... }
function AuthorName() { ... }
...
```
- 명확한 섹션 구분으로 코드 가독성 향상
- 타입, 상수, 컴포넌트 순으로 논리적 구조화

## Props 인터페이스

### AuthorProfileProps

`AuthorProfileProps`는 `AuthorInfo` 타입을 확장하며, 다음과 같은 속성을 포함합니다:

| Prop 이름 | 타입 | 필수 여부 | 기본값 | 설명 |
|----------|------|----------|--------|------|
| name | string | required | - | 저자의 이름 |
| avatar | string | required | - | 저자 프로필 이미지 경로 (URL 또는 로컬 경로) |
| bio | string | required | - | 저자 소개 문구 |
| social | SocialInfo | optional | undefined | 소셜 미디어 링크 정보 객체 |
| authorSlug | string | optional | undefined | 저자 프로필 페이지로 연결되는 slug (제공 시 이름이 링크로 변환됨) |

### SocialInfo 타입

`social` prop은 다음과 같은 선택적 속성을 가진 객체입니다:

| 속성 이름 | 타입 | 설명 |
|----------|------|------|
| github | string | GitHub 프로필 URL |
| twitter | string | Twitter 프로필 URL |
| linkedin | string | LinkedIn 프로필 URL |
| website | string | 개인 웹사이트 URL |

## 하위 컴포넌트

`AuthorProfile`은 다음과 같은 내부 컴포넌트들로 구성되어 있습니다:

### AuthorAvatar

저자의 프로필 이미지를 표시하는 컴포넌트입니다.

**Props:**
- `name` (string): 이미지 alt 텍스트 생성에 사용
- `avatar` (string): 이미지 경로

**특징:**
- Next.js `Image` 컴포넌트를 사용하여 자동 최적화
- 64x64 픽셀 크기로 표시
- `priority` 속성으로 빠른 로딩 보장
- 둥근 모서리 스타일 적용

### AuthorName

저자의 이름을 표시하는 컴포넌트입니다.

**Props:**
- `name` (string): 저자 이름
- `authorSlug` (string, optional): 프로필 페이지 slug

**특징:**
- 이름 뒤에 "Sir" 호칭 자동 추가
- `authorSlug` 제공 시 `/blog/author/{authorSlug}` 경로로 링크 생성
- 링크인 경우 호버 효과 적용
- 시맨틱 HTML `<h3>` 태그 사용

### AuthorBio

저자의 간략한 소개를 표시하는 컴포넌트입니다.

**Props:**
- `bio` (string): 저자 소개 문구

**특징:**
- 작은 글씨 크기와 중립적인 색상으로 가독성 향상
- 다크 모드 지원

### SocialLinks

저자의 소셜 미디어 링크들을 표시하는 컴포넌트입니다.

**Props:**
- `social` (SocialInfo, optional): 소셜 미디어 정보 객체

**특징:**
- 제공된 소셜 링크만 선택적으로 표시
- 모든 링크가 없을 경우 null 반환 (렌더링 안 함)
- 시맨틱 HTML `<nav>` 태그 사용
- 접근성을 위한 aria-label 제공
- `SOCIAL_PLATFORM_CONFIG`를 사용한 설정 기반 렌더링으로 타입 안정성 보장

**내부 동작:**
```typescript
const socialLinks = (Object.keys(SOCIAL_PLATFORM_CONFIG) as SocialPlatform[])
  .filter((platform) => social[platform])
  .map((platform): SocialLink => {
    const config = SOCIAL_PLATFORM_CONFIG[platform]
    return {
      href: social[platform]!,
      label: config.label,
      ariaLabel: config.ariaLabel,
    }
  })
```

이 접근 방식은 다음과 같은 이점을 제공합니다:
- 설정 기반으로 새 플랫폼 추가가 용이
- 타입 안정성 보장
- 코드 중복 제거

### SocialLinkItem

개별 소셜 미디어 링크를 렌더링하는 컴포넌트입니다.

**Props:**
- `href` (string): 링크 URL
- `label` (string): 화면에 표시될 텍스트
- `ariaLabel` (string): 스크린 리더를 위한 설명

**특징:**
- 새 탭에서 열림 (`target="_blank"`)
- 보안을 위한 `rel="noopener noreferrer"` 속성 적용
- 호버 시 색상 변경 효과

## 사용 예제

### 기본 사용법

```tsx
import { AuthorProfile } from 'app/components/author-profile'

export default function BlogPost() {
  const author = {
    name: '홍길동',
    avatar: '/images/authors/hong.jpg',
    bio: '프론트엔드 개발자이자 오픈소스 기여자입니다.',
    social: {
      github: 'https://github.com/honggildong',
      twitter: 'https://twitter.com/honggildong',
      linkedin: 'https://linkedin.com/in/honggildong',
      website: 'https://honggildong.dev'
    }
  }

  return (
    <article>
      {/* 블로그 포스트 내용 */}
      <AuthorProfile {...author} />
    </article>
  )
}
```

### authorSlug를 사용한 링크 연결

```tsx
import { AuthorProfile } from 'app/components/author-profile'

export default function BlogPost() {
  return (
    <AuthorProfile
      name="김개발"
      avatar="/images/authors/kim.jpg"
      bio="백엔드 아키텍트이며 클라우드 전문가입니다."
      authorSlug="kim-developer"
      social={{
        github: 'https://github.com/kimdev',
        linkedin: 'https://linkedin.com/in/kimdev'
      }}
    />
  )
}
```

### 소셜 링크 없는 최소 구성

```tsx
import { AuthorProfile } from 'app/components/author-profile'

export default function BlogPost() {
  return (
    <AuthorProfile
      name="이코딩"
      avatar="/images/authors/lee.jpg"
      bio="주니어 개발자로 성장하는 중입니다."
    />
  )
}
```

### utils.ts의 DEFAULT_AUTHOR 활용

```tsx
import { AuthorProfile } from 'app/components/author-profile'
import { DEFAULT_AUTHOR } from 'app/blog/utils'

export default function BlogPost() {
  return (
    <AuthorProfile {...DEFAULT_AUTHOR} />
  )
}
```

## 접근성 기능

`AuthorProfile` 컴포넌트는 웹 접근성 표준을 준수하기 위해 다음과 같은 기능을 제공합니다:

### ARIA 속성

- **article 컨테이너**: `aria-label="저자 프로필"`로 섹션의 목적을 명확히 전달
- **소셜 링크 내비게이션**: `aria-label="저자 소셜 미디어 링크"`로 네비게이션 영역 식별
- **개별 링크**: 각 소셜 링크에 `aria-label` 제공 (예: "GitHub 프로필 방문")
- **저자 이름 링크**: `aria-label="{name}의 프로필 보기"`로 링크 목적 명시

### 시맨틱 HTML

- `<article>`: 독립적인 콘텐츠 블록으로 저자 프로필 표현
- `<h3>`: 저자 이름을 제목 요소로 구조화
- `<nav>`: 소셜 링크를 네비게이션 영역으로 명시
- `<p>`: 저자 소개를 문단으로 표현

### 이미지 접근성

- `alt` 속성: "{name}의 프로필 사진" 형식으로 스크린 리더에 의미 있는 정보 제공
- Next.js Image 컴포넌트의 자동 최적화로 빠른 로딩

### 키보드 내비게이션

- 모든 링크는 키보드로 접근 가능
- 시각적 포커스 인디케이터 제공 (브라우저 기본 또는 Tailwind 스타일)

## 스타일링 정보

### 스타일 및 설정 상수

컴포넌트는 여러 상수를 사용하여 중앙 집중식으로 관리합니다:

#### AVATAR_SIZE

```typescript
const AVATAR_SIZE = 64
```

아바타 이미지의 너비와 높이를 픽셀 단위로 정의합니다.

#### STYLES

Tailwind CSS 클래스를 중앙 집중식으로 관리하는 객체입니다:

```typescript
const STYLES = {
  container: 'mt-16 mb-8 border-t border-neutral-200 dark:border-neutral-800 pt-8',
  contentWrapper: 'flex items-start gap-4',
  avatar: 'rounded-full',
  authorInfo: 'flex-1',
  authorNameBase: 'font-semibold text-lg text-neutral-900 dark:text-neutral-100',
  authorNameHover: 'hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors',
  bio: 'mt-2 text-sm text-neutral-600 dark:text-neutral-400',
  socialLinksContainer: 'flex gap-4 mt-3',
  socialLink: 'text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors',
} as const
```

#### SOCIAL_PLATFORM_CONFIG

소셜 플랫폼별 레이블과 접근성 레이블을 관리하는 설정 객체입니다:

```typescript
const SOCIAL_PLATFORM_CONFIG: Record<
  SocialPlatform,
  { label: string; ariaLabel: string }
> = {
  github: { label: 'GitHub', ariaLabel: 'GitHub 프로필 방문' },
  twitter: { label: 'Twitter', ariaLabel: 'Twitter 프로필 방문' },
  linkedin: { label: 'LinkedIn', ariaLabel: 'LinkedIn 프로필 방문' },
  website: { label: 'Website', ariaLabel: '개인 웹사이트 방문' },
} as const
```

**장점**:
- **중앙화된 관리**: 모든 소셜 플랫폼 설정이 한 곳에 집중
- **타입 안정성**: `SocialPlatform` 타입과 함께 사용하여 컴파일 타임 오류 감지
- **유지보수성**: 새 플랫폼 추가 시 이 객체만 수정하면 됨
- **일관성**: 모든 플랫폼에 대해 동일한 구조 보장

### 다크 모드 지원

모든 텍스트 및 경계선 색상은 다크 모드 변형을 포함합니다:
- 라이트 모드: `text-neutral-900`, `border-neutral-200`
- 다크 모드: `dark:text-neutral-100`, `dark:border-neutral-800`

### 레이아웃 구조

```
┌─────────────────────────────────────────────┐
│ [상단 구분선]                                │
├─────────────────────────────────────────────┤
│ [Avatar]  [Name (링크 가능)]               │
│           [Bio]                              │
│           [GitHub] [Twitter] [LinkedIn] [Web]│
└─────────────────────────────────────────────┘
```

- **Flexbox 레이아웃**: 아바타와 정보를 가로로 배치
- **간격**: 요소 간 일관된 간격 (`gap-4`, `mt-2`, `mt-3`)
- **반응형**: Flexbox로 자연스러운 반응형 동작

## 타입 정의 설명

### AuthorInfo (app/blog/utils.ts)

```typescript
export type AuthorInfo = {
  name: string
  avatar: string
  bio: string
  social?: {
    twitter?: string
    github?: string
    linkedin?: string
    website?: string
  }
}
```

블로그 시스템 전체에서 사용되는 저자 정보 타입입니다. MDX 파일의 frontmatter에서 파싱되거나 기본값(`DEFAULT_AUTHOR`)으로 제공됩니다.

### SocialPlatform (author-profile.tsx)

```typescript
type SocialPlatform = keyof NonNullable<AuthorInfo['social']>
```

소셜 플랫폼 타입으로, `AuthorInfo['social']` 객체의 키를 추출하여 타입 안정성을 보장합니다. 현재 지원되는 플랫폼: `'github' | 'twitter' | 'linkedin' | 'website'`

### SocialLink (author-profile.tsx)

```typescript
type SocialLink = {
  href: string
  label: string
  ariaLabel: string
}
```

내부적으로 소셜 링크를 렌더링하기 위해 사용되는 타입입니다. `SocialLinks` 컴포넌트에서 `SOCIAL_PLATFORM_CONFIG`와 `social` 객체를 결합하여 이 형식의 배열로 변환합니다.

### AuthorProfileProps

```typescript
type AuthorProfileProps = AuthorInfo & {
  authorSlug?: string
}
```

`AuthorInfo` 타입을 확장하여 선택적 `authorSlug` 속성을 추가합니다. 이를 통해 저자 이름을 클릭 가능한 링크로 만들 수 있습니다.

## 주의사항 및 베스트 프랙티스

### 이미지 경로

- **로컬 이미지**: `/public` 폴더 기준의 절대 경로 사용 (예: `/images/authors/profile.jpg`)
- **외부 이미지**: 전체 URL 사용 가능하지만 Next.js `next.config.js`에 도메인 설정 필요
- **이미지 최적화**: Next.js Image 컴포넌트가 자동으로 WebP 변환 및 크기 최적화 수행

### 소셜 링크 URL 형식

모든 소셜 링크는 전체 URL 형식으로 제공해야 합니다:

```typescript
// ✅ 올바른 형식
social: {
  github: 'https://github.com/username',
  twitter: 'https://twitter.com/username',
  linkedin: 'https://linkedin.com/in/username',
  website: 'https://example.com'
}

// ❌ 잘못된 형식
social: {
  github: 'username', // 상대 경로나 부분 경로는 작동하지 않음
}
```

### authorSlug 사용 시 주의사항

- `authorSlug`를 제공할 경우 해당 경로(`/blog/author/{authorSlug}`)에 실제 페이지가 존재해야 합니다
- slug는 URL-safe한 문자열이어야 합니다 (소문자, 하이픈 사용 권장)
- 예: `"hong-gildong"`, `"kim-developer"`

### 성능 최적화

- **이미지 priority**: 아바타 이미지는 `priority` 속성으로 우선 로딩
- **조건부 렌더링**: 소셜 링크가 없을 경우 `SocialLinks` 컴포넌트가 null을 반환하여 불필요한 DOM 생성 방지
- **스타일 상수화**: Tailwind 클래스를 `STYLES` 객체로 관리하여 재사용성 향상

### 접근성 체크리스트

- [ ] 모든 이미지에 의미 있는 `alt` 텍스트 제공
- [ ] 링크에 명확한 `aria-label` 제공
- [ ] 시맨틱 HTML 요소 사용 (`article`, `nav`, `h3`)
- [ ] 키보드 내비게이션 테스트
- [ ] 스크린 리더로 테스트
- [ ] 다크 모드에서 충분한 대비(contrast) 확인

### 스타일 커스터마이징

스타일을 수정하려면 `STYLES` 객체의 Tailwind 클래스를 변경합니다:

```typescript
const STYLES = {
  container: 'mt-20 mb-10 border-t-2 border-blue-500 pt-10', // 커스터마이징 예시
  // ... 나머지 스타일
} as const
```

### 소셜 플랫폼 추가하기

새로운 소셜 플랫폼을 추가하려면:

1. `app/blog/utils.ts`의 `AuthorInfo` 타입에 새 플랫폼 추가:
```typescript
export type AuthorInfo = {
  // ...
  social?: {
    // 기존 플랫폼
    github?: string
    twitter?: string
    linkedin?: string
    website?: string
    // 새 플랫폼 추가
    instagram?: string
  }
}
```

2. `SOCIAL_PLATFORM_CONFIG`에 설정 추가:
```typescript
const SOCIAL_PLATFORM_CONFIG: Record<
  SocialPlatform,
  { label: string; ariaLabel: string }
> = {
  // 기존 설정
  github: { label: 'GitHub', ariaLabel: 'GitHub 프로필 방문' },
  // 새 플랫폼 설정 추가
  instagram: { label: 'Instagram', ariaLabel: 'Instagram 프로필 방문' },
} as const
```

이렇게 하면 `SocialPlatform` 타입이 자동으로 업데이트되고, 나머지 코드는 수정 없이 작동합니다.

### DEFAULT_AUTHOR 설정

프로젝트의 기본 저자 정보는 `app/blog/utils.ts`에서 설정할 수 있습니다:

```typescript
export const DEFAULT_AUTHOR: AuthorInfo = {
  name: '당신의 이름',
  avatar: '/images/authors/your-avatar.jpg',
  bio: '당신의 소개',
  social: {
    github: 'https://github.com/yourusername',
    // ...
  },
}
```

### 타입 안정성

TypeScript를 사용하므로 컴파일 타임에 타입 오류를 감지할 수 있습니다. 모든 필수 props를 제공했는지 확인하세요:

```typescript
// ✅ 타입 안전
<AuthorProfile
  name="홍길동"
  avatar="/images/hong.jpg"
  bio="개발자입니다."
/>

// ❌ 타입 오류 (필수 props 누락)
<AuthorProfile name="홍길동" />
```

## 관련 컴포넌트

- **MDXContent**: 블로그 포스트 본문을 렌더링하는 컴포넌트
- **BlogPost**: 블로그 포스트 전체 페이지 레이아웃
- **AuthorList**: 여러 저자를 목록으로 표시하는 컴포넌트 (존재하는 경우)

## 의존성

- `next/image`: 최적화된 이미지 렌더링
- `next/link`: 클라이언트 사이드 라우팅
- `app/blog/utils`: `AuthorInfo` 타입 정의

## 버전 정보

- **Next.js**: 13+ (App Router 사용)
- **React**: 18+
- **TypeScript**: 5+
