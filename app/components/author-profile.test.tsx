import { render, screen } from '@testing-library/react'
import { AuthorProfile } from './author-profile'
import type { AuthorInfo } from 'app/blog/utils'

// Mock Next.js Image and Link components
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...props }: any) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  },
}))

// Test helpers
const createAuthorInfo = (overrides?: Partial<AuthorInfo>): AuthorInfo => ({
  name: 'John Doe',
  avatar: '/images/john-doe.jpg',
  bio: '소프트웨어 엔지니어이자 기술 블로거입니다.',
  social: {
    github: 'https://github.com/johndoe',
    twitter: 'https://twitter.com/johndoe',
    linkedin: 'https://linkedin.com/in/johndoe',
    website: 'https://johndoe.com',
  },
  ...overrides,
})

const getSocialLink = (platform: 'GitHub' | 'Twitter' | 'LinkedIn' | 'Website') => {
  const labels = {
    GitHub: 'GitHub 프로필 방문',
    Twitter: 'Twitter 프로필 방문',
    LinkedIn: 'LinkedIn 프로필 방문',
    Website: '개인 웹사이트 방문',
  }
  return screen.getByRole('link', { name: labels[platform] })
}

const querySocialLink = (platform: 'GitHub' | 'Twitter' | 'LinkedIn' | 'Website') => {
  const labels = {
    GitHub: 'GitHub 프로필 방문',
    Twitter: 'Twitter 프로필 방문',
    LinkedIn: 'LinkedIn 프로필 방문',
    Website: '개인 웹사이트 방문',
  }
  return screen.queryByRole('link', { name: labels[platform] })
}

const expectSocialLinkToExist = (platform: 'GitHub' | 'Twitter' | 'LinkedIn' | 'Website') => {
  expect(getSocialLink(platform)).toBeInTheDocument()
}

const expectSocialLinkNotToExist = (platform: 'GitHub' | 'Twitter' | 'LinkedIn' | 'Website') => {
  expect(querySocialLink(platform)).not.toBeInTheDocument()
}

describe('AuthorProfile', () => {
  const baseAuthorInfo = createAuthorInfo()

  describe('Basic Rendering', () => {
    it('should render all elements when all props are provided', () => {
      render(<AuthorProfile {...baseAuthorInfo} authorSlug="john-doe" />)

      // Check main container
      const article = screen.getByRole('article', { name: '저자 프로필' })
      expect(article).toBeInTheDocument()

      // Check author name with "Sir" suffix
      expect(screen.getByRole('heading', { name: 'John Doe Sir' })).toBeInTheDocument()

      // Check avatar image
      const avatar = screen.getByAltText('John Doe의 프로필 사진')
      expect(avatar).toBeInTheDocument()
      expect(avatar).toHaveAttribute('src', '/images/john-doe.jpg')
      expect(avatar).toHaveAttribute('width', '64')
      expect(avatar).toHaveAttribute('height', '64')

      // Check bio
      expect(screen.getByText('소프트웨어 엔지니어이자 기술 블로거입니다.')).toBeInTheDocument()

      // Check all social links using helper
      expectSocialLinkToExist('GitHub')
      expectSocialLinkToExist('Twitter')
      expectSocialLinkToExist('LinkedIn')
      expectSocialLinkToExist('Website')
    })

    it('should render without authorSlug', () => {
      render(<AuthorProfile {...baseAuthorInfo} />)

      // Author name should be a heading, not wrapped in a link
      const heading = screen.getByRole('heading', { name: 'John Doe Sir' })
      expect(heading).toBeInTheDocument()

      // Should not have a link to author profile
      const profileLink = screen.queryByRole('link', { name: 'John Doe의 프로필 보기' })
      expect(profileLink).not.toBeInTheDocument()
    })

    it('should render without social links', () => {
      const authorWithoutSocial = createAuthorInfo({ social: undefined })

      render(<AuthorProfile {...authorWithoutSocial} />)

      // Social navigation should not exist
      const socialNav = screen.queryByRole('navigation', { name: '저자 소셜 미디어 링크' })
      expect(socialNav).not.toBeInTheDocument()

      // Other elements should still render
      expect(screen.getByRole('heading', { name: 'John Doe Sir' })).toBeInTheDocument()
      expect(screen.getByAltText('John Doe의 프로필 사진')).toBeInTheDocument()
    })
  })

  describe('SOCIAL_PLATFORM_CONFIG Integration', () => {
    it('should use correct labels from SOCIAL_PLATFORM_CONFIG for all platforms', () => {
      render(<AuthorProfile {...baseAuthorInfo} />)

      // Verify text content matches config
      expect(screen.getByText('GitHub')).toBeInTheDocument()
      expect(screen.getByText('Twitter')).toBeInTheDocument()
      expect(screen.getByText('LinkedIn')).toBeInTheDocument()
      expect(screen.getByText('Website')).toBeInTheDocument()
    })

    it('should use correct aria-labels from SOCIAL_PLATFORM_CONFIG', () => {
      render(<AuthorProfile {...baseAuthorInfo} />)

      expect(getSocialLink('GitHub')).toHaveAttribute('aria-label', 'GitHub 프로필 방문')
      expect(getSocialLink('Twitter')).toHaveAttribute('aria-label', 'Twitter 프로필 방문')
      expect(getSocialLink('LinkedIn')).toHaveAttribute('aria-label', 'LinkedIn 프로필 방문')
      expect(getSocialLink('Website')).toHaveAttribute('aria-label', '개인 웹사이트 방문')
    })

    it('should render social links in the order defined by SOCIAL_PLATFORM_CONFIG keys', () => {
      render(<AuthorProfile {...baseAuthorInfo} />)

      const socialLinks = screen.getAllByRole('link', { name: /프로필 방문|웹사이트 방문/ })

      // Expected order: github, twitter, linkedin, website
      expect(socialLinks[0]).toHaveAttribute('aria-label', 'GitHub 프로필 방문')
      expect(socialLinks[1]).toHaveAttribute('aria-label', 'Twitter 프로필 방문')
      expect(socialLinks[2]).toHaveAttribute('aria-label', 'LinkedIn 프로필 방문')
      expect(socialLinks[3]).toHaveAttribute('aria-label', '개인 웹사이트 방문')
    })

    it('should maintain consistent order even when some platforms are missing', () => {
      const authorInfo = createAuthorInfo({
        social: {
          github: 'https://github.com/johndoe',
          linkedin: 'https://linkedin.com/in/johndoe',
        },
      })

      render(<AuthorProfile {...authorInfo} />)

      const socialLinks = screen.getAllByRole('link', { name: /프로필 방문/ })

      // GitHub should come before LinkedIn
      expect(socialLinks[0]).toHaveAttribute('aria-label', 'GitHub 프로필 방문')
      expect(socialLinks[1]).toHaveAttribute('aria-label', 'LinkedIn 프로필 방문')
    })
  })

  describe('Social Links Combinations', () => {
    it('should render only GitHub link when only GitHub is provided', () => {
      const authorInfo = createAuthorInfo({
        social: {
          github: 'https://github.com/johndoe',
        },
      })

      render(<AuthorProfile {...authorInfo} />)

      expectSocialLinkToExist('GitHub')
      expectSocialLinkNotToExist('Twitter')
      expectSocialLinkNotToExist('LinkedIn')
      expectSocialLinkNotToExist('Website')
    })

    it('should render only Twitter link when only Twitter is provided', () => {
      const authorInfo = createAuthorInfo({
        social: {
          twitter: 'https://twitter.com/johndoe',
        },
      })

      render(<AuthorProfile {...authorInfo} />)

      expectSocialLinkNotToExist('GitHub')
      expectSocialLinkToExist('Twitter')
      expectSocialLinkNotToExist('LinkedIn')
      expectSocialLinkNotToExist('Website')
    })

    it('should render only LinkedIn link when only LinkedIn is provided', () => {
      const authorInfo = createAuthorInfo({
        social: {
          linkedin: 'https://linkedin.com/in/johndoe',
        },
      })

      render(<AuthorProfile {...authorInfo} />)

      expectSocialLinkNotToExist('GitHub')
      expectSocialLinkNotToExist('Twitter')
      expectSocialLinkToExist('LinkedIn')
      expectSocialLinkNotToExist('Website')
    })

    it('should render only Website link when only Website is provided', () => {
      const authorInfo = createAuthorInfo({
        social: {
          website: 'https://johndoe.com',
        },
      })

      render(<AuthorProfile {...authorInfo} />)

      expectSocialLinkNotToExist('GitHub')
      expectSocialLinkNotToExist('Twitter')
      expectSocialLinkNotToExist('LinkedIn')
      expectSocialLinkToExist('Website')
    })

    it('should render multiple social links when some are provided', () => {
      const authorInfo = createAuthorInfo({
        social: {
          github: 'https://github.com/johndoe',
          website: 'https://johndoe.com',
        },
      })

      render(<AuthorProfile {...authorInfo} />)

      expectSocialLinkToExist('GitHub')
      expectSocialLinkNotToExist('Twitter')
      expectSocialLinkNotToExist('LinkedIn')
      expectSocialLinkToExist('Website')
    })

    it('should not render social navigation when empty social object is provided', () => {
      const authorInfo = createAuthorInfo({ social: {} })

      render(<AuthorProfile {...authorInfo} />)

      const socialNav = screen.queryByRole('navigation', { name: '저자 소셜 미디어 링크' })
      expect(socialNav).not.toBeInTheDocument()
    })

    it('should not render social navigation when all social values are undefined', () => {
      const authorInfo = createAuthorInfo({
        social: {
          github: undefined,
          twitter: undefined,
          linkedin: undefined,
          website: undefined,
        },
      })

      render(<AuthorProfile {...authorInfo} />)

      const socialNav = screen.queryByRole('navigation', { name: '저자 소셜 미디어 링크' })
      expect(socialNav).not.toBeInTheDocument()
    })

    it('should handle mix of defined and undefined social links', () => {
      const authorInfo = createAuthorInfo({
        social: {
          github: 'https://github.com/johndoe',
          twitter: undefined,
          linkedin: 'https://linkedin.com/in/johndoe',
          website: undefined,
        },
      })

      render(<AuthorProfile {...authorInfo} />)

      expectSocialLinkToExist('GitHub')
      expectSocialLinkNotToExist('Twitter')
      expectSocialLinkToExist('LinkedIn')
      expectSocialLinkNotToExist('Website')
    })
  })

  describe('Accessibility', () => {
    it('should have proper aria-label on main article', () => {
      render(<AuthorProfile {...baseAuthorInfo} />)

      const article = screen.getByRole('article', { name: '저자 프로필' })
      expect(article).toHaveAttribute('aria-label', '저자 프로필')
    })

    it('should have proper aria-label on author profile link', () => {
      render(<AuthorProfile {...baseAuthorInfo} authorSlug="john-doe" />)

      const profileLink = screen.getByRole('link', { name: 'John Doe의 프로필 보기' })
      expect(profileLink).toHaveAttribute('aria-label', 'John Doe의 프로필 보기')
    })

    it('should have descriptive alt text on avatar image', () => {
      render(<AuthorProfile {...baseAuthorInfo} />)

      const avatar = screen.getByAltText('John Doe의 프로필 사진')
      expect(avatar).toBeInTheDocument()
    })

    it('should have proper aria-labels on social links', () => {
      render(<AuthorProfile {...baseAuthorInfo} />)

      expect(getSocialLink('GitHub')).toHaveAttribute('aria-label', 'GitHub 프로필 방문')
      expect(getSocialLink('Twitter')).toHaveAttribute('aria-label', 'Twitter 프로필 방문')
      expect(getSocialLink('LinkedIn')).toHaveAttribute('aria-label', 'LinkedIn 프로필 방문')
      expect(getSocialLink('Website')).toHaveAttribute('aria-label', '개인 웹사이트 방문')
    })

    it('should have proper aria-label on social navigation', () => {
      render(<AuthorProfile {...baseAuthorInfo} />)

      const socialNav = screen.getByRole('navigation', { name: '저자 소셜 미디어 링크' })
      expect(socialNav).toHaveAttribute('aria-label', '저자 소셜 미디어 링크')
    })

    it('should have priority attribute on avatar image for performance', () => {
      render(<AuthorProfile {...baseAuthorInfo} />)

      const avatar = screen.getByAltText('John Doe의 프로필 사진')
      expect(avatar).toHaveAttribute('priority')
    })

    it('should use semantic nav element for social links', () => {
      render(<AuthorProfile {...baseAuthorInfo} />)

      const socialNav = screen.getByRole('navigation', { name: '저자 소셜 미디어 링크' })
      expect(socialNav.tagName).toBe('NAV')
    })

    it('should use semantic article element for main container', () => {
      render(<AuthorProfile {...baseAuthorInfo} />)

      const article = screen.getByRole('article', { name: '저자 프로필' })
      expect(article.tagName).toBe('ARTICLE')
    })
  })

  describe('Link Behavior', () => {
    it('should render Link component with correct href when authorSlug is provided', () => {
      render(<AuthorProfile {...baseAuthorInfo} authorSlug="john-doe" />)

      const profileLink = screen.getByRole('link', { name: 'John Doe의 프로필 보기' })
      expect(profileLink).toHaveAttribute('href', '/blog/author/john-doe')
    })

    it('should not render Link component when authorSlug is not provided', () => {
      render(<AuthorProfile {...baseAuthorInfo} />)

      const profileLink = screen.queryByRole('link', { name: 'John Doe의 프로필 보기' })
      expect(profileLink).not.toBeInTheDocument()

      // Should render as plain heading instead
      expect(screen.getByRole('heading', { name: 'John Doe Sir' })).toBeInTheDocument()
    })

    it('should apply hover styles to author name when authorSlug is provided', () => {
      render(<AuthorProfile {...baseAuthorInfo} authorSlug="john-doe" />)

      const heading = screen.getByRole('heading', { name: 'John Doe Sir' })
      expect(heading).toHaveClass('hover:text-neutral-600')
      expect(heading).toHaveClass('dark:hover:text-neutral-300')
      expect(heading).toHaveClass('transition-colors')
    })

    it('should not apply hover styles to author name when authorSlug is not provided', () => {
      render(<AuthorProfile {...baseAuthorInfo} />)

      const heading = screen.getByRole('heading', { name: 'John Doe Sir' })
      expect(heading).not.toHaveClass('hover:text-neutral-600')
      expect(heading).not.toHaveClass('dark:hover:text-neutral-300')
      expect(heading).not.toHaveClass('transition-colors')
    })

    it('should apply base styles to author name regardless of authorSlug', () => {
      const { rerender } = render(<AuthorProfile {...baseAuthorInfo} />)

      const heading = screen.getByRole('heading', { name: 'John Doe Sir' })
      expect(heading).toHaveClass('font-semibold')
      expect(heading).toHaveClass('text-lg')
      expect(heading).toHaveClass('text-neutral-900')
      expect(heading).toHaveClass('dark:text-neutral-100')

      rerender(<AuthorProfile {...baseAuthorInfo} authorSlug="john-doe" />)

      const headingWithSlug = screen.getByRole('heading', { name: 'John Doe Sir' })
      expect(headingWithSlug).toHaveClass('font-semibold')
      expect(headingWithSlug).toHaveClass('text-lg')
      expect(headingWithSlug).toHaveClass('text-neutral-900')
      expect(headingWithSlug).toHaveClass('dark:text-neutral-100')
    })

    it('should handle authorSlug with special characters', () => {
      render(<AuthorProfile {...baseAuthorInfo} authorSlug="john-o-brien-smith" />)

      const profileLink = screen.getByRole('link', { name: 'John Doe의 프로필 보기' })
      expect(profileLink).toHaveAttribute('href', '/blog/author/john-o-brien-smith')
    })
  })

  describe('External Link Attributes', () => {
    it('should have target="_blank" and rel="noopener noreferrer" on all social links', () => {
      render(<AuthorProfile {...baseAuthorInfo} />)

      const socialLinks = [
        getSocialLink('GitHub'),
        getSocialLink('Twitter'),
        getSocialLink('LinkedIn'),
        getSocialLink('Website'),
      ]

      socialLinks.forEach((link) => {
        expect(link).toHaveAttribute('target', '_blank')
        expect(link).toHaveAttribute('rel', 'noopener noreferrer')
      })
    })

    it('should have correct href on all social links', () => {
      render(<AuthorProfile {...baseAuthorInfo} />)

      expect(getSocialLink('GitHub')).toHaveAttribute('href', 'https://github.com/johndoe')
      expect(getSocialLink('Twitter')).toHaveAttribute('href', 'https://twitter.com/johndoe')
      expect(getSocialLink('LinkedIn')).toHaveAttribute(
        'href',
        'https://linkedin.com/in/johndoe'
      )
      expect(getSocialLink('Website')).toHaveAttribute('href', 'https://johndoe.com')
    })
  })

  describe('Image Rendering', () => {
    it('should render image with correct src', () => {
      render(<AuthorProfile {...baseAuthorInfo} />)

      const avatar = screen.getByAltText('John Doe의 프로필 사진')
      expect(avatar).toHaveAttribute('src', '/images/john-doe.jpg')
    })

    it('should render image with correct dimensions', () => {
      render(<AuthorProfile {...baseAuthorInfo} />)

      const avatar = screen.getByAltText('John Doe의 프로필 사진')
      expect(avatar).toHaveAttribute('width', '64')
      expect(avatar).toHaveAttribute('height', '64')
    })

    it('should render image with rounded-full class', () => {
      render(<AuthorProfile {...baseAuthorInfo} />)

      const avatar = screen.getByAltText('John Doe의 프로필 사진')
      expect(avatar).toHaveClass('rounded-full')
    })
  })

  describe('Edge Cases', () => {
    it('should handle name with special characters', () => {
      const authorInfo = createAuthorInfo({ name: "O'Brien-Smith" })

      render(<AuthorProfile {...authorInfo} />)

      expect(screen.getByRole('heading', { name: "O'Brien-Smith Sir" })).toBeInTheDocument()
      expect(screen.getByAltText("O'Brien-Smith의 프로필 사진")).toBeInTheDocument()
    })

    it('should handle long bio text', () => {
      const longBio =
        '매우 긴 자기소개 텍스트입니다. '.repeat(20) + '끝까지 잘 렌더링되어야 합니다.'

      const authorInfo = createAuthorInfo({ bio: longBio })

      render(<AuthorProfile {...authorInfo} />)

      expect(screen.getByText(longBio)).toBeInTheDocument()
    })

    it('should handle empty string in social links gracefully', () => {
      const authorInfo = createAuthorInfo({
        social: {
          github: '',
          twitter: 'https://twitter.com/johndoe',
        },
      })

      render(<AuthorProfile {...authorInfo} />)

      // Empty string should be falsy and not render
      expectSocialLinkNotToExist('GitHub')
      expectSocialLinkToExist('Twitter')
    })

    it('should handle avatar path with query parameters', () => {
      const authorInfo = createAuthorInfo({
        avatar: '/images/john-doe.jpg?v=2',
      })

      render(<AuthorProfile {...authorInfo} />)

      const avatar = screen.getByAltText('John Doe의 프로필 사진')
      expect(avatar).toHaveAttribute('src', '/images/john-doe.jpg?v=2')
    })

    it('should render correctly with minimal props', () => {
      const minimalAuthor = createAuthorInfo({
        name: 'Jane',
        avatar: '/avatar.jpg',
        bio: 'Developer',
        social: undefined,
      })

      render(<AuthorProfile {...minimalAuthor} />)

      expect(screen.getByRole('heading', { name: 'Jane Sir' })).toBeInTheDocument()
      expect(screen.getByAltText('Jane의 프로필 사진')).toBeInTheDocument()
      expect(screen.getByText('Developer')).toBeInTheDocument()
      expect(
        screen.queryByRole('navigation', { name: '저자 소셜 미디어 링크' })
      ).not.toBeInTheDocument()
    })

    it('should handle name with Unicode characters', () => {
      const authorInfo = createAuthorInfo({ name: '김철수' })

      render(<AuthorProfile {...authorInfo} />)

      expect(screen.getByRole('heading', { name: '김철수 Sir' })).toBeInTheDocument()
      expect(screen.getByAltText('김철수의 프로필 사진')).toBeInTheDocument()
    })

    it('should handle extremely short name', () => {
      const authorInfo = createAuthorInfo({ name: 'A' })

      render(<AuthorProfile {...authorInfo} />)

      expect(screen.getByRole('heading', { name: 'A Sir' })).toBeInTheDocument()
      expect(screen.getByAltText('A의 프로필 사진')).toBeInTheDocument()
    })

    it('should handle bio with special characters and line breaks', () => {
      const bioWithSpecialChars = 'Developer & Designer\nFull-stack engineer @ Tech Corp.'

      const authorInfo = createAuthorInfo({ bio: bioWithSpecialChars })

      render(<AuthorProfile {...authorInfo} />)

      expect(screen.getByText(bioWithSpecialChars)).toBeInTheDocument()
    })

    it('should handle URLs with special characters in social links', () => {
      const authorInfo = createAuthorInfo({
        social: {
          github: 'https://github.com/user-name_123',
          website: 'https://example.com/~user?id=123&ref=blog',
        },
      })

      render(<AuthorProfile {...authorInfo} />)

      expect(getSocialLink('GitHub')).toHaveAttribute(
        'href',
        'https://github.com/user-name_123'
      )
      expect(getSocialLink('Website')).toHaveAttribute(
        'href',
        'https://example.com/~user?id=123&ref=blog'
      )
    })

    it('should handle all platforms being empty strings', () => {
      const authorInfo = createAuthorInfo({
        social: {
          github: '',
          twitter: '',
          linkedin: '',
          website: '',
        },
      })

      render(<AuthorProfile {...authorInfo} />)

      const socialNav = screen.queryByRole('navigation', { name: '저자 소셜 미디어 링크' })
      expect(socialNav).not.toBeInTheDocument()
    })
  })

  describe('Component Integration', () => {
    it('should render all sub-components correctly', () => {
      render(<AuthorProfile {...baseAuthorInfo} authorSlug="john-doe" />)

      // AuthorAvatar
      expect(screen.getByAltText('John Doe의 프로필 사진')).toBeInTheDocument()

      // AuthorName
      expect(screen.getByRole('heading', { name: 'John Doe Sir' })).toBeInTheDocument()

      // AuthorBio
      expect(screen.getByText('소프트웨어 엔지니어이자 기술 블로거입니다.')).toBeInTheDocument()

      // SocialLinks
      const socialNav = screen.getByRole('navigation', { name: '저자 소셜 미디어 링크' })
      expect(socialNav).toBeInTheDocument()
    })

    it('should maintain correct DOM structure', () => {
      const { container } = render(<AuthorProfile {...baseAuthorInfo} />)

      const article = container.querySelector('article')
      expect(article).toBeInTheDocument()

      const contentWrapper = article?.querySelector('div')
      expect(contentWrapper).toBeInTheDocument()

      const avatar = contentWrapper?.querySelector('img')
      expect(avatar).toBeInTheDocument()

      const authorInfo = contentWrapper?.querySelector('div')
      expect(authorInfo).toBeInTheDocument()
    })
  })

  describe('Styling', () => {
    it('should apply correct container styles', () => {
      const { container } = render(<AuthorProfile {...baseAuthorInfo} />)

      const article = container.querySelector('article')
      expect(article).toHaveClass('mt-16')
      expect(article).toHaveClass('mb-8')
      expect(article).toHaveClass('border-t')
      expect(article).toHaveClass('pt-8')
    })

    it('should apply correct social link styles', () => {
      render(<AuthorProfile {...baseAuthorInfo} />)

      const githubLink = getSocialLink('GitHub')
      expect(githubLink).toHaveClass('text-sm')
      expect(githubLink).toHaveClass('text-neutral-600')
      expect(githubLink).toHaveClass('dark:text-neutral-400')
      expect(githubLink).toHaveClass('hover:text-neutral-900')
      expect(githubLink).toHaveClass('dark:hover:text-neutral-100')
      expect(githubLink).toHaveClass('transition-colors')
    })
  })
})
