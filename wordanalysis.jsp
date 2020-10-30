<%@ page contentType="text/html;charset=gbk" import="org.ansj.app.keyword.*,net.sf.json.*,java.util.*,java.io.*,java.util.regex.*,java.text.DecimalFormat" language="java" pageEncoding="gbk"%><%!
public class WordItem {
	public String word;  //单词内容
	public float weight;  //权重
	public WordItem()
	{
		word = null;
		weight = 0;
	}
	
	public float getWeight()
	{
		return weight;
	}
	
	public String getWord()
	{
		return word;
	}
	
	public void setWeight(float a)
	{
		this.weight = a;
	}
	
	public void setWord(String w)
	{
		this.word = w;
	}
}

public void sort(WordItem[] w)
    {
    	WordItem temp = new WordItem();
    	for(int i=0;i<w.length-1;i++)
    	{
    		for(int j=0;j<w.length-1-i;j++)
    		{
    			if(w[j].getWeight()<w[j+1].getWeight())
    			{
    				temp = w[j];
    				w[j] = w[j+1];
    				w[j+1] = temp;
    			}
    		}
    	}
    }

public static boolean isContainChinese(String str) {
        Pattern p = Pattern.compile("[\u4e00-\u9fa5]");
        Matcher m = p.matcher(str);
        if (m.find()) {
            return true;
        }
        return false;
    }
    
public static boolean isNumeric(String str){ 
     Pattern pattern = Pattern.compile("[0-9]*"); 
     return pattern.matcher(str).matches();    
}

public static String toUpperCase4Index(String string) {  
    char[] methodName = string.toCharArray();  
    methodName[0] = toUpperCase(methodName[0]);  
    return String.valueOf(methodName);  
}

public static char toUpperCase(char chars) {  
    if (97 <= chars && chars <= 122) {  
        chars ^= 32;  
    }  
    return chars;  
} 

 %><% 
    //接收参数 
    String txt = request.getParameter("txt");
    int Wordsnum = 50; 
    //控制台输出表单数据看看 
    //out.println("txt=" + Txt[0]);
    JSONObject obj = new JSONObject();
    String regex = "[【】、—.。,\"!--;:?\'\\]]";   
    try
    {
       //初始化停用词表
       Set stopwordset = new HashSet<String>();
	   String Stopword[] = {"a","able","about","above","abst","accordance","according","accordingly","across","act","actually","added","adj","adopted","affected","affecting","affects","after","afterwards","again","against","ah","ain't","all","allow","allows","almost","alone","along","already","also","although","always","am","among","amongst","an","and","announce","another","any","anybody","anyhow","anymore","anyone","anything","anyway","anyways","anywhere","apart","apparently","appear","appreciate","appropriate","approximately","are","area","areas","aren","arent","aren't","arise","around","as","a's","aside","ask","asked","asking","asks","associated","at","auth","available","away","awfully","b","back","backed","backing","backs","be","became","because","become","becomes","becoming","been","before","beforehand","began","begin","beginning","beginnings","begins","behind","being","beings","believe","below","beside","besides","best","better","between","beyond","big","biol","both","brief","briefly","but","by","c","ca","came","can","cannot","cant","can't","case","cases","cause","causes","certain","certainly","changes","clear","clearly","c'mon","co","com","come","comes","concerning","consequently","consider","considering","contain","containing","contains","corresponding","could","couldnt","couldn't","course","c's","currently","d","'d","date","definitely","describe","described","despite","did","didn't","differ","different","differently","discuss","do","does","doesn't","doing","done","don't","down","downed","downing","downs","downwards","due","during","e","each","early","ed","edu","effect","eg","eight","eighty","either","else","elsewhere","end","ended","ending","ends","enough","entirely","especially","et","et-al","etc","even","evenly","ever","every","everybody","everyone","everything","everywhere","ex","exactly","example","except","f","face","faces","fact","facts","far","felt","few","ff","fifth","find","finds","first","five","fix","followed","following","follows","for","former","formerly","forth","found","four","from","full","fully","further","furthered","furthering","furthermore","furthers","g","gave","general","generally","get","gets","getting","give","given","gives","giving","go","goes","going","gone","good","goods","got","gotten","great","greater","greatest","greetings","group","grouped","grouping","groups","h","had","hadn't","happens","hardly","has","hasn't","have","haven't","having","he","hed","hello","help","hence","her","here","hereafter","hereby","herein","heres","here's","hereupon","hers","herself","hes","he's","hi","hid","high","higher","highest","him","himself","his","hither","home","hopefully","how","howbeit","however","hundred","I","i","id","I'd","ie","if","ignored","I'll","im","I'm","immediate","immediately","importance","important","in","inasmuch","inc","include","indeed","index","indicate","indicated","indicates","information","inner","insofar","instead","interest","interested","interesting","interests","into","invention","inward","is","isn't","it","itd","it'd","it'll","its","it's","itself","I've","j","just","k","keep","keeps","kept","keys","kg","kind","km","knew","know","known","knows","l","large","largely","last","lately","later","latest","latter","latterly","least","less","lest","let","lets","let's","like","liked","likely","line","little","'ll","long","longer","longest","look","looking","looks","ltd","m","'m","made","mainly","make","makes","making","man","many","may","maybe","me","mean","means","meantime","meanwhile","member","members","men","merely","mg","might","million","miss","ml","more","moreover","most","mostly","mr","mrs","much","mug","must","my","myself","n","na","name","namely","nay","nd","near","nearly","necessarily","necessary","need","needed","needing","needs","neither","never","nevertheless","new","newer","newest","next","nine","ninety","no","nobody","non","none","nonetheless","noone","nor","normally","nos","not","noted","nothing","novel","now","Now","nowhere","n't","number","numbers","o","obtain","obtained","obviously","of","off","often","oh","ok","okay","old","older","oldest","omitted","on","once","one","ones","only","onto","open","opened","opening","opens","or","ord","order","ordered","ordering","orders","other","others","otherwise","ought","our","ours","ourselves","out","outside","over","overall","owing","own","p","page","pages","part","parted","particular","particularly","parting","parts","past","per","perhaps","place","placed","places","please","plus","point","pointed","pointing","points","poorly","possible","possibly","potentially","pp","predominantly","present","presented","presenting","presents","presumably","previously","primarily","probably","problem","problems","promptly","proud","provides","put","puts","q","que","quickly","quite","qv","r","ran","rather","rd","re","'re","readily","really","reasonably","recent","recently","ref","refs","regarding","regardless","regards","related","relatively","research","respectively","resulted","resulting","results","right","room","rooms","run","s","'s","said","same","saw","say","saying","says","sec","second","secondly","seconds","section","see","seeing","seem","seemed","seeming","seems","seen","sees","self","selves","sensible","sent","serious","seriously","seven","several","shall","she","shed","she'll","shes","should","shouldn't","show","showed","showing","shown","showns","shows","side","sides","significant","significantly","similar","similarly","since","six","slightly","small","smaller","smallest","so","So","some","Some","somebody","somehow","someone","somethan","something","sometime","sometimes","somewhat","somewhere","soon","sorry","specifically","specified","specify","specifying","state","states","still","stop","strongly","sub","substantially","successfully","such","sufficiently","suggest","sup","sure","t","'t","take","taken","taking","tell","tends","th","than","thank","thanks","thanx","that","that'll","thats","that's","that've","the","their","theirs","them","themselves","then","thence","there","thereafter","thereby","thered","therefore","therein","there'll","thereof","therere","theres","there's","thereto","thereupon","there've","these","they","theyd","they'd","they'll","theyre","they're","they've","thing","things","think","thinks","third","this","thorough","thoroughly","those","thou","though","thoughh","thought","thoughts","thousand","three","throug","through","throughout","thru","thus","til","tip","to","today","together","too","took","toward","towards","tried","tries","truly","try","trying","ts","t's","turn","turned","turning","turns","twice","two","u","un","under","unfortunately","unless","unlike","unlikely","until","unto","up","upon","ups","us","use","used","useful","usefully","usefulness","uses","using","usually","uucp","v","value","various","'ve","very","via","viz","vol","vols","vs","w","want","wanted","wanting","wants","was","wasn't","way","ways","we","wed","we'd","welcome","well","we'll","wells","went","were","we're","weren't","we've","what","whatever","what'll","whats","what's","when","whence","whenever","where","whereafter","whereas","whereby","wherein","wheres","where's","whereupon","wherever","whether","which","while","whim","whither","who","whod","whoever","whole","who'll","whom","whomever","whos","who's","whose","why","widely","will","willing","wish","with","within","without","wonder","won't","words","work","worked","working","works","world","would","wouldn't","www","x","y","year","years","yes","yet","you","youd","you'd","you'll","young","younger","youngest","your","youre","you're","yours","yourself","yourselves","you've","z","zero"}; 
	   for(int snum=0;snum<Stopword.length;snum++)
	   {
		   stopwordset.add(Stopword[snum]);
	   }
       List<List<String>> wolistall = new ArrayList<List<String>>();
       List<List<Double>> welistall = new ArrayList<List<Double>>();
       
       	   boolean isChinese = isContainChinese(txt);
       	   if(!isChinese)
       	   {
       	   //英文分词处理，过滤了数字，且过滤了大小写，最后输出首字母大写的单词
       	       HashMap<String, Integer> hashMap=new HashMap<String, Integer>(); 
	           txt=txt.replaceAll(regex, " ");
		       StringTokenizer tokenizer = new StringTokenizer(txt);
		       while(tokenizer.hasMoreTokens()){
		        	//去掉停用词
		        	boolean isstopword = false;
		            String word=tokenizer.nextToken().toLowerCase();
		            Iterator it=stopwordset.iterator();
		            while(it.hasNext())
		            {
		            	String stopword=(String) it.next();
		            	if(stopword.equalsIgnoreCase(word))
		            	{
		            		isstopword = true;
		            		break;
		            	}
		            }
		            boolean isNum = isNumeric(word);
		            //如果不是停用词，将单词放入列表中，若已添加过，则将词频+1
		            if(!isstopword && !isNum)
		            {
		            	if(!hashMap.containsKey(word)){    
		                    hashMap.put(word, new Integer(1));    
		                }else{    
		                    int k=hashMap.get(word).intValue()+1;    
		                    hashMap.put(word, new Integer(k));    
		                }
		            }   
		        }
		        
		        Iterator iterator=hashMap.keySet().iterator();
		        WordItem[] owordlist = new WordItem[hashMap.size()];
		        int i = 0;
		        while(iterator.hasNext()){
			        String word=(String) iterator.next();
			        owordlist[i] = new WordItem();
			        owordlist[i].setWord(word);
			        owordlist[i].setWeight(hashMap.get(word));
			        i++;
		        }
		        this.sort(owordlist);//按词频从大到小排列
		        int length = owordlist.length < Wordsnum ? owordlist.length : Wordsnum;
		        List<String> wolist = new ArrayList<String>();
		        List<Double> welist = new ArrayList<Double>();
		        DecimalFormat df = new DecimalFormat("######0.00"); 
		        for(int e=0; e<length;e++)
		            {
		            	//向单词列表中添加单词，其中单词权重由本单词词频/最高单词词频得出，范围在0-1之间
		            	WordItem ww = new WordItem();
		            	//String word=toUpperCase4Index(owordlist[e].getWord());
		            	String word=owordlist[e].getWord();
		            	float weight = owordlist[e].getWeight()/owordlist[0].getWeight();
		            	wolist.add(word);
		            	welist.add(Double.valueOf(df.format(weight)));
		            }
			    //obj.put("wolist", wolist);
			    //obj.put("welist", welist);
			    //out.println(obj.toString());
			    wolistall.add(wolist);
			    welistall.add(welist);
	       	}
	       	else
	       	{
	       	 //中文分词处理
	       		KeyWordComputer kwc = new KeyWordComputer(50);
	       		List<org.ansj.app.keyword.Keyword> result = kwc.computeArticleTfidf(txt);
	       		List<String> wolist = new ArrayList<String>();
		        List<Double> welist = new ArrayList<Double>();
		        DecimalFormat df = new DecimalFormat("######0.00");
		        double maxscore = result.get(0).getScore();
		        for(int e=0;e<result.size();e++)
		        {
		        	wolist.add(result.get(e).getName());
		        	welist.add(Double.valueOf(df.format(result.get(e).getScore()/maxscore)));
		        }
		        wolistall.add(wolist);
		        welistall.add(welist);
	       	}
       	obj.put("wolistall",wolistall);
		obj.put("welistall",welistall);
		out.println(obj.toString());
           
    }
     catch (FileNotFoundException e) {  
            e.printStackTrace();
            out.println("读取文件失败");
        } catch (IOException e) {  
            e.printStackTrace();  
            out.println("不知怎么的IO失败");
        }

%>