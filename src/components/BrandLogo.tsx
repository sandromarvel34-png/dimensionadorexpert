import logo from "@/assets/logo-ae.png";

export function BrandLogo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="137 468 1597 832"
      width="1597"
      height="832"
      role="img"
      aria-label="Academia do Eletricista"
      className={className}
    >
      <image href={logo} width="1875" height="1875" />
    </svg>
  );
}
