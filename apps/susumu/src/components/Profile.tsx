import * as Evolu from '@evolu/common';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  Flex,
  Link,
  Popover,
  Reset,
  Skeleton,
  Text,
} from '@radix-ui/themes';
import jsQR from 'jsqr';
import QrCode from 'qrcode';
import { Suspense, use, useMemo, useRef } from 'react';

import { useEvolu } from '../hooks/useEvolu';

export const Profile = () => {
  const evolu = useEvolu();
  const owner = use(evolu.appOwner);
  const qrCode = useMemo(
    () => QrCode.toDataURL(owner.mnemonic),
    [owner.mnemonic],
  );
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);

  return (
    <Flex gap="4" align="center">
      <Popover.Root>
        <Popover.Trigger>
          <Reset>
            <button>
              <Avatar fallback="A" size="3" />
            </button>
          </Reset>
        </Popover.Trigger>
        <Popover.Content>
          <Suspense
            fallback={<Skeleton width="200px" height="200px" />}
          >
            <img
              src={use(qrCode)}
              alt="QR Code"
              style={{ width: '200px', height: '200px' }}
            />
          </Suspense>
        </Popover.Content>
      </Popover.Root>
      <Flex direction="column">
        <Text size="2">{owner.id}</Text>
        <Flex>
          <Dialog.Root
            onOpenChange={async (isOpen) => {
              // Release the stream when the popover is closed
              if (!isOpen && video.current.srcObject) {
                (video.current.srcObject as MediaStream)
                  .getTracks()
                  .forEach((track) => {
                    track.stop();
                  });
              }

              if (isOpen) {
                try {
                  const stream =
                    await navigator.mediaDevices.getUserMedia({
                      video: {
                        facingMode: 'environment',
                      },
                      audio: false,
                    });

                  video.current.srcObject = stream;
                } catch (err) {
                  console.error('Camera error:', err);
                }
              }
            }}
          >
            <Dialog.Trigger>
              <Link href="#" color="orange" size="1">
                Load user
              </Link>
            </Dialog.Trigger>
            <Dialog.Content size="4">
              <Dialog.Title>Choosing user</Dialog.Title>
              <Dialog.Description>
                Take a photo of QR code from other device
              </Dialog.Description>

              <Box mt={'5'} position="relative">
                <video
                  ref={video}
                  autoPlay
                  muted
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                />
                <canvas
                  ref={canvas}
                  className="absolute inset-0 hidden"
                />
              </Box>

              <Box mt={'5'}>
                <Dialog.Close>
                  <Button
                    onClick={() => {
                      canvas.current.width =
                        video.current.videoWidth;
                      canvas.current.height =
                        video.current.videoHeight;
                      const ctx =
                        canvas.current.getContext('2d');

                      ctx.drawImage(
                        video.current,
                        0,
                        0,
                        canvas.current.width,
                        canvas.current.height,
                      );
                      const image = ctx.getImageData(
                        0,
                        0,
                        canvas.current.width,
                        canvas.current.height,
                      );

                      const code = jsQR(
                        image.data,
                        image.width,
                        image.height,
                        { inversionAttempts: 'dontInvert' },
                      );

                      if (code) {
                        evolu.restoreAppOwner(
                          Evolu.Mnemonic.orThrow(code.data),
                          {
                            reload: true,
                          },
                        );
                      } else {
                        alert('No QR code found');
                      }
                    }}
                  >
                    Capture photo
                  </Button>
                </Dialog.Close>
              </Box>
            </Dialog.Content>
          </Dialog.Root>
        </Flex>
      </Flex>
    </Flex>
  );
};
