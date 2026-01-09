import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { useConfigStore } from '@/store/configStore'

interface SettingsModalProps {
  isVisible: boolean
  onClose: () => void
}

export default function SettingsModal({ isVisible, onClose }: SettingsModalProps) {
  const {
    AUTO_SHOW_ADVANCED,
    AUTO_EXPAND_MESSAGES,
    setAutoShowAdvanced,
    setAutoExpandMessages,
  } = useConfigStore()

  const [localConfig, setLocalConfig] = useState({
    AUTO_SHOW_ADVANCED: false,
    AUTO_EXPAND_MESSAGES: false,
  })

  useEffect(() => {
    if (isVisible) {
      setLocalConfig({
        AUTO_SHOW_ADVANCED,
        AUTO_EXPAND_MESSAGES,
      })
    }
  }, [isVisible, AUTO_SHOW_ADVANCED, AUTO_EXPAND_MESSAGES])

  const handleSave = () => {
    setAutoShowAdvanced(localConfig.AUTO_SHOW_ADVANCED)
    setAutoExpandMessages(localConfig.AUTO_EXPAND_MESSAGES)
    onClose()
  }

  return (
    <Dialog open={isVisible} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your application preferences
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto-show-advanced"
                checked={localConfig.AUTO_SHOW_ADVANCED}
                onCheckedChange={(checked) =>
                  setLocalConfig((prev) => ({
                    ...prev,
                    AUTO_SHOW_ADVANCED: checked === true,
                  }))
                }
              />
              <label
                htmlFor="auto-show-advanced"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Auto show advanced setting
              </label>
            </div>
            <p className="text-sm text-muted-foreground">
              Automatically expand "Advanced Settings" in configuration forms.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="auto-expand-messages"
                checked={localConfig.AUTO_EXPAND_MESSAGES}
                onCheckedChange={(checked) =>
                  setLocalConfig((prev) => ({
                    ...prev,
                    AUTO_EXPAND_MESSAGES: checked === true,
                  }))
                }
              />
              <label
                htmlFor="auto-expand-messages"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Automatically expand messages
              </label>
            </div>
            <p className="text-sm text-muted-foreground">
              Automatically expand message content in the chat view.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
