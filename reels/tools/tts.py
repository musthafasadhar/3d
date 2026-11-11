# Edge neural TTS wrapper. edge-tts pins certifi's CA list; in this environment HTTPS goes
# through a proxy whose CA is in /root/.ccr/ca-bundle.crt, so point certifi there when present.
# Usage: python3 tts.py <voice> <rate e.g. +20%> <pitch e.g. +0Hz> <text> <out.mp3>
import os, sys, asyncio, certifi
CA = '/root/.ccr/ca-bundle.crt'
if os.path.exists(CA):
    certifi.where = lambda: CA
import edge_tts
voice, rate, pitch, text, out = sys.argv[1:6]
asyncio.run(edge_tts.Communicate(text, voice, rate=rate, pitch=pitch).save(out))
