const VIEW=document.querySelector('textarea')

class Cleaver{
  constructor(monolhitic=false){
    this.monolhitic=monolhitic
  }
  
  cleave(code){
    let replace=[[': ',':'],[', ',','],[' {','{'],['const ','let '],[' =>','=>'],['=> ','=>'],
                  ['for ','for'],['} ','}'],['; ',';'],[' ,',','],]
    let operators=['=','<','+','/','+=','&&','-','||']
    if(!code.includes(' from ')) operators.push('*')
    for(let o of operators) replace.push([` ${o} `,o])
    if(!code.includes("'")) replace.push(['"',"'"])
    if(!code.includes('for')&&!code.includes(':')) replace.push([';',''])
    for(let r of replace) code=code.replaceAll(r[0],r[1])
    return code
  }
  
  butcher(code){
    if(this.monolhitic) return this.cleave(code)
    return code.split('\n').map(line=>this.cleave(line)).filter(line=>line.trim().length>0).join('\n')  
  }
}

class Comments extends Cleaver{
  constructor(){
    super()
  }
  
  cleave(code){
    if(code.includes('//')) code=code.slice(0,code.indexOf('//'))
    if(code.includes('/*')) code=code.replace(code.slice(code.indexOf('/*'),code.indexOf('*/')+2),'')
    return code
  }
}

class Join extends Cleaver{
  constructor(){
    super(true)
  }
  
  trim(a,b,code){
    while(code.includes(a)) code=code.replace(a,b)
    return code
  }
  
  join(code,index){
    let close=code.slice(index).indexOf('}')+index
    if(close<0) return code
    let body=code.slice(index,close+1)
    if(body.slice(1).includes('{')) return code
    let line=code.slice(index-20,index)//TODO
    if(line.includes('try')||line.includes('catch')) return code
    let lines=body.split('\n').length
    if(lines>3) return code
    let joined=body
    if(lines==1){
      if(code[index-1]==')') return code
      joined=joined.replace('{',' ').replace('}','')
    }else{
      joined=body.replaceAll('\n',' ')
      joined=this.trim('{ ','{',joined)
      joined=this.trim(' }','}',joined)
    }
    return code.replace(body,joined)
  }
  
  cleave(code){
    for(let i=0;i<code.length;i++) if(code[i]=='{') code=this.join(code,i)
    return code
  }
}

class Trim extends Cleaver{
  constructor(){
    super()
  }
  
  cleave(code){
    while(code.endsWith(' ')) code=code.slice(0,-1)
    return code
  }
}

var cleavers=[new Cleaver(),new Comments(),new Join(),new Trim()]

function input(){
  let code=VIEW.value
  for(let c of cleavers) code=c.butcher(code)
  let changed=VIEW.value!=code
  VIEW.value=code
  if(changed) input()
}

export function setup(){
  VIEW.addEventListener('input',input)
  input()
  VIEW.focus()
}
