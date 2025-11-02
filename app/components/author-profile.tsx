import Image from 'next/image'
import Link from 'next/link'
import type { AuthorInfo } from 'app/blog/utils'

// Types
type AuthorProfileProps = AuthorInfo & {
  authorSlug?: string
}

type SocialLink = {
  href: string
  label: string
  ariaLabel: string
}

type SocialPlatform = keyof NonNullable<AuthorInfo['social']>

// Constants
const AVATAR_SIZE = 64

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

const SOCIAL_PLATFORM_CONFIG: Record<
  SocialPlatform,
  { label: string; ariaLabel: string }
> = {
  github: { label: 'GitHub', ariaLabel: 'GitHub 프로필 방문' },
  twitter: { label: 'Twitter', ariaLabel: 'Twitter 프로필 방문' },
  linkedin: { label: 'LinkedIn', ariaLabel: 'LinkedIn 프로필 방문' },
  website: { label: 'Website', ariaLabel: '개인 웹사이트 방문' },
} as const

function AuthorAvatar({ name, avatar }: { name: string; avatar: string }) {
  return (
    <Image
      src={avatar}
      alt={`${name}의 프로필 사진`}
      width={AVATAR_SIZE}
      height={AVATAR_SIZE}
      className={STYLES.avatar}
      priority
    />
  )
}

function AuthorName({ name, authorSlug }: { name: string; authorSlug?: string }) {
  const displayName = `${name} Sir`
  const className = [STYLES.authorNameBase, authorSlug && STYLES.authorNameHover]
    .filter(Boolean)
    .join(' ')

  if (authorSlug) {
    return (
      <Link href={`/blog/author/${authorSlug}`} aria-label={`${name}의 프로필 보기`}>
        <h3 className={className}>{displayName}</h3>
      </Link>
    )
  }

  return <h3 className={className}>{displayName}</h3>
}

function AuthorBio({ bio }: { bio: string }) {
  return <p className={STYLES.bio}>{bio}</p>
}

function SocialLinkItem({ href, label, ariaLabel }: SocialLink) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={STYLES.socialLink}
      aria-label={ariaLabel}
    >
      {label}
    </a>
  )
}

function SocialLinks({ social }: { social?: AuthorInfo['social'] }) {
  if (!social) {
    return null
  }

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

  if (socialLinks.length === 0) {
    return null
  }

  return (
    <nav className={STYLES.socialLinksContainer} aria-label="저자 소셜 미디어 링크">
      {socialLinks.map((link) => (
        <SocialLinkItem key={link.href} {...link} />
      ))}
    </nav>
  )
}

export function AuthorProfile({
  name,
  avatar,
  bio,
  social,
  authorSlug,
}: AuthorProfileProps) {
  return (
    <article className={STYLES.container} aria-label="저자 프로필">
      <div className={STYLES.contentWrapper}>
        <AuthorAvatar name={name} avatar={avatar} />
        <div className={STYLES.authorInfo}>
          <AuthorName name={name} authorSlug={authorSlug} />
          <AuthorBio bio={bio} />
          <SocialLinks social={social} />
        </div>
      </div>
    </article>
  )
}
