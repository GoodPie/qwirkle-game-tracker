import {Button} from "@ui/button.tsx";


interface LobbyErrorProps {
  title: string;
  message: string | null;
  onRetry: () => void;
}

export function LobbyError({title, message, onRetry}: Readonly<LobbyErrorProps>) {
  return (
    <div className="max-w-md w-full space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground">{message}</p>
      </div>
      {onRetry &&
          <Button onClick={onRetry} className="w-full">
              Try Again
          </Button>
      }

    </div>
  )
}