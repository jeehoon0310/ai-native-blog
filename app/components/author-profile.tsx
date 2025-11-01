import Image from 'next/image'
import Link from 'next/link'
import type { AuthorInfo } from 'app/blog/utils'

type AuthorProfileProps = AuthorInfo & {
  authorSlug?: string
}

export function AuthorProfile({
  name,
  avatar,
  bio,
  social,
  authorSlug,
}: AuthorProfileProps) {
  return (
    <div className="mt-16 mb-8 border-t border-neutral-200 dark:border-neutral-800 pt-8">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Image
          src={avatar}
          alt={name}
          width={64}
          height={64}
          className="rounded-full"
        />

        {/* Author Info */}
        <div className="flex-1">
          {authorSlug ? (
            <Link href={`/blog/author/${authorSlug}`}>
              <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                {name} Sir
              </h3>
            </Link>
          ) : (
            <h3 className="font-semibold text-lg text-neutral-900 dark:text-neutral-100">
              {name} Sir
            </h3>
          )}

          <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
            {bio}
          </p>

          {/* Social Links */}
          {social && (
            <div className="flex gap-4 mt-3">
              {social.github && (
                <a
                  href={social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  GitHub
                </a>
              )}
              {social.twitter && (
                <a
                  href={social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  Twitter
                </a>
              )}
              {social.linkedin && (
                <a
                  href={social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  LinkedIn
                </a>
              )}
              {social.website && (
                <a
                  href={social.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
                >
                  Website
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
