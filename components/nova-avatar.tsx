interface NovaAvatarProps {
  size?: "small" | "default" | "large"
}

export default function NovaAvatar({ size = "default" }: NovaAvatarProps) {
  const dimensions = size === "large" ? "w-32 h-32" : size === "small" ? "w-full h-full" : "w-12 h-12"

  return (
    <div className={`relative overflow-hidden ${dimensions}`}>
      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bcb5db0d-30ee-4a51-8339-17c59b8de450-tXFl8Nq6FpHeD8yqw5l3EekzGBH5xI.png"
        alt="NOVA AI Assistant"
        className="w-full h-full object-cover"
      />
    </div>
  )
}
