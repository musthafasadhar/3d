import json, re
def syl(w):
    w=re.sub(r'[^a-z]','',w.lower())
    if w=='erp': return 3
    if w=='tara': return 2
    g=re.findall(r'[aeiouy]+',w); n=len(g)
    if w.endswith('e') and not w.endswith(('le','ee')) and n>1: n-=1
    return max(1,n)
# (t0,t1, pre, key, post, fx)  — times on the EDITED timeline (seconds)
C=[
 (0.37,1.62,"Different","departments","",None),
 (1.62,3.48,"work","separately","in the school.","spread"),
 (3.80,4.95,"But the","information","",None),
 (4.95,5.64,"is also","separate.","","spread"),
 (5.93,7.15,"If the","admission","department",None),
 (7.15,8.42,"adds a","student,","",None),
 (8.78,9.95,"the","academic","team works",None),
 (9.95,11.27,"with the same","student.","",None),
 (11.59,12.95,"The","accounts","team maintains",None),
 (12.95,14.96,"a","fee structure","for the student.",None),
 (15.40,16.28,"The","transport","team",None),
 (16.35,17.68,"assigns the","route.","",None),
 (18.00,19.70,"Usually, every","department","",None),
 (19.70,21.04,"maintains their","own data.","",None),
 (21.24,22.24,"But in","Tara,","",'brand'),
 (22.51,24.37,"the","departments","work differently,",None),
 (24.84,26.00,"the","student details","",None),
 (26.00,27.64,"are connected in a","connected system.","",'tight'),
 (27.80,28.95,"There is","no need","",None),
 (28.95,30.15,"to enter the","same work","",None),
 (30.15,31.32,"","again and again.","",None),
 (31.67,32.60,"What if the","departments","",None),
 (32.60,33.48,"work","differently?","",None),
 (33.62,34.50,"The","details","are in a",None),
 (34.50,35.84,"","connected system.","",'tight'),
 (36.01,37.90,"And that's the one of the","biggest idea","",None),
 (37.90,39.03,"behind","Tara ERP.","",'brand'),
 (39.40,41.25,"If you want to","know more","about our Tara ERP,",None),
 (41.60,42.55,"please","comment","below.",None),
 (42.60,44.08,"We will","contact you.","",None),
]
out=[]
for t0,t1,pre,key,post,fx in C:
    words=[]
    for row,txt in (('pre',pre),('key',key),('post',post)):
        for w in txt.split():
            words.append({'w':w,'row':row,'s':syl(w)})
    tot=sum(w['s'] for w in words); acc=0
    for w in words:
        w['t']=round(t0+(t1-t0)*acc/tot*0.92,3); acc+=w['s']
    out.append({'t0':t0,'t1':t1,'words':words,'fx':fx})
json.dump(out,open('cards.json','w'),indent=0)
print(len(out),'cards')
