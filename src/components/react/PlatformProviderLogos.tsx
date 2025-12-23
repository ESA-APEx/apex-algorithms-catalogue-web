import { isFeatureEnabled } from "@/lib/featureflag";

interface LogoDetail {
  name: string;
  logoUrl?: string;
  website?: string;
}

interface PlatformProviderLogosProps {
  platform?: LogoDetail;
  provider?: LogoDetail;
}

export const PlatformProviderLogos = ({
  platform,
  provider,
}: PlatformProviderLogosProps) => {
  const isEnabled = isFeatureEnabled(
    window.location.href,
    "providerPlatformLogo",
  );

  if (!isEnabled) {
    return null;
  }

  return (
    <>
      {platform && (
        <li data-testid="powered-by">
          <div className="text-white mb-2">Powered by</div>
          {platform.logoUrl && (
            <a href={platform.website} target="__blank">
              <img
                src={platform.logoUrl}
                alt={platform.name}
                className="h-8 object-contain mb-1"
              />
            </a>
          )}
        </li>
      )}
      {provider && (
        <li data-testid="provided-by">
          <div className="text-white mb-2">Provided by</div>
          {provider.logoUrl && (
            <a href={provider.website} target="__blank">
              <img
                src={provider.logoUrl}
                alt={provider.name}
                className="h-8 object-contain mb-1"
              />
            </a>
          )}
        </li>
      )}
    </>
  );
};
