import subprocess, random, sys, json, os
U='/root/.claude/skills/real-sfx/vendor/node_modules/uisfx/sounds/glass/'
VOL={'press':.20,'focus':.12,'select':.20,'toggle-on':.20,'check':.17,'open':.18,'expand':.16,'drop':.22,'snap':.20,'swipe':.14,'invalid-drop':.19,'send':.20,'receive':.20,'notification':.20,'mention':.22,'typing':.07,'reaction':.17,'success':.23,'warning':.22,'info':.16,'start':.19,'progress-step':.12,'complete':.24,'connecting':.09,'connect':.20,'unlock':.20,'reward':.22,'level-up':.25,'achievement':.26,'badge':.22}
random.seed(4)
cues=[]
def c(t,name,g=1.0): cues.append((t,name,VOL[name]*g))
c(0.00,'swipe',.9); c(1.00,'expand'); c(2.05,'invalid-drop',.7); c(3.55,'snap')
c(5.78,'open')
for i in range(12): c(6.08+i/12,'typing',1.0+random.uniform(-.25,.25))
for i in range(7): c(7.08+i/10,'typing',1.0+random.uniform(-.25,.25))
c(7.50,'press'); c(7.71,'success',.9)
c(8.50,'notification',.8); c(9.90,'connect')
for i in range(3): c(10.65+i*.12,'check',.8)
c(11.50,'notification',.8); c(12.90,'open')
for i in range(4): c(13.35+i*.22,'progress-step',1.0)
c(15.30,'notification',.8); c(16.30,'start'); c(17.25,'info')
c(17.75,'warning',.55); c(18.90,'invalid-drop',.6)
c(21.00,'swipe'); c(21.10,'level-up')
c(24.40,'connecting'); c(25.40,'connect')
c(27.85,'select'); c(28.70,'drop',.8); c(29.15,'success',.9)
c(31.60,'select',.8); c(32.75,'connect',.8)
c(33.60,'open')
for i in range(4): c(34.50+i*.22,'check',.8)
c(36.05,'badge',.7); c(37.93,'reward')
c(39.40,'mention'); c(41.50,'press'); c(42.55,'success',.9)
c(44.10,'achievement')
json.dump(cues,open('sfx_cues.json','w'),indent=0)
G=float(sys.argv[1]) if len(sys.argv)>1 else 0.85   # global gain for sfx bus
ins=[];fc=[]
for i,(t,n,v) in enumerate(cues):
    ins+=['-i',U+n+'.mp3']
    fc.append(f'[{i}:a]aformat=sample_rates=44100:channel_layouts=stereo,volume={v*G*4.0:.4f},adelay={int(t*1000)}|{int(t*1000)}[s{i}]')
mix=''.join(f'[s{i}]' for i in range(len(cues)))
fc.append(f'{mix}amix=inputs={len(cues)}:normalize=0:duration=longest,atrim=0:45.7,apad=whole_dur=45.7[sfx]')
cmd=['ffmpeg','-v','error','-y']+ins+['-filter_complex',';'.join(fc),'-map','[sfx]','-ar','44100','-ac','2','sfx_track.wav']
subprocess.run(cmd,check=True); print('sfx track',len(cues),'cues')
