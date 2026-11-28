import subprocess, random, sys, json
U='/root/.claude/skills/real-sfx/vendor/node_modules/uisfx/sounds/glass/'
VOL={'press':.20,'select':.20,'check':.17,'open':.18,'swipe':.14,'invalid-drop':.19,'info':.16,'start':.19,'progress-step':.12,'complete':.24,'connecting':.09,'connect':.20,'reward':.22,'level-up':.25,'achievement':.26,'success':.23,'warning':.22,'lock':.18,'typing':.07,'notification':.20}
random.seed(7); cues=[]
def c(t,n,g=1.0): cues.append((t,n,VOL[n]*g))
c(0.12,'select',.7)
c(1.55,'swipe'); c(1.85,'select',.7); c(2.40,'lock',.8); c(2.75,'invalid-drop',.6)
c(3.55,'swipe',.9)
c(5.78,'swipe')
for i in range(12): c(6.08+i/12,'typing',1.0+random.uniform(-.25,.25))
for i in range(7): c(7.08+i/10,'typing',1.0+random.uniform(-.25,.25))
c(7.58,'press'); c(7.73,'success',.9)
c(8.55,'select',.8); c(9.90,'swipe'); c(10.25,'connect',.8); c(10.55,'check',.8); c(10.67,'check',.8)
c(11.50,'select',.8); c(12.90,'swipe')
for i in range(3): c(13.45+i*.28,'progress-step')
c(14.40,'success',.8)
c(15.30,'select',.8); c(16.30,'swipe'); c(17.45,'info')
c(17.75,'swipe',.8); c(17.95,'warning',.45); c(18.80,'invalid-drop',.6)
c(21.10,'level-up'); c(22.45,'swipe',.9); c(22.62,'select',.6); c(22.86,'select',.6)
c(24.40,'swipe'); c(24.80,'connecting'); c(25.75,'connect',.8)
c(27.70,'swipe',.9); c(27.95,'success',.8)
c(33.60,'swipe')
for i in range(3): c(34.07+i*.1,'check',.7)
c(35.95,'info',.7); c(37.93,'reward'); c(41.60,'select',.8); c(42.60,'success',.8)
c(43.80,'swipe'); c(44.12,'achievement')
json.dump(cues,open('sfx_cues2.json','w'))
G=float(sys.argv[1]) if len(sys.argv)>1 else 0.55
ins=[];fc=[]
for i,(t,n,v) in enumerate(cues):
    ins+=['-i',U+n+'.mp3']; fc.append(f'[{i}:a]aformat=sample_rates=44100:channel_layouts=stereo,volume={v*G*4.0:.4f},adelay={int(t*1000)}|{int(t*1000)}[s{i}]')
fc.append(''.join(f'[s{i}]' for i in range(len(cues)))+f'amix=inputs={len(cues)}:normalize=0:duration=longest,atrim=0:46.7,apad=whole_dur=46.7[sfx]')
subprocess.run(['ffmpeg','-v','error','-y']+ins+['-filter_complex',';'.join(fc),'-map','[sfx]','-ar','44100','-ac','2','sfx_track2.wav'],check=True)
print('sfx',len(cues),'cues')
