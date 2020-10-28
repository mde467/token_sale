
const App ={
    web3Provider : null,
    contracts:{},
    account:'0x0',
    loading: false,
    tokenPrice:0,
    tokensSold :0,
    tokensAvailable :750000,
    init: function(){
        console.log("App initializes...");       
        return App.initWeb3();
    },

    initWeb3: function(){
        if(typeof web3 !== 'undefined'){
            //If a web3 instance is already provided by metamask
            App.web3Provider = web3.currentProvider;
            web3=new Web3(web3.currentProvider);
        }else{
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:9545');
            web3 = new Web3(App.web3Provider);
        }
       // App.listenForEvents();
        return App.initContract();  
    },

    initContract : function(){
        $.getJSON("DappTokenSale.json", function(dappTokenSale){
            App.contracts.DappTokenSale = TruffleContract(dappTokenSale);
            App.contracts.DappTokenSale.setProvider(App.web3Provider);
            App.contracts.DappTokenSale.deployed().then(function(dappTokenSale){
                console.log("Dapp Token Sale Address:", dappTokenSale.address);
            })
        }).done(function(){
                $.getJSON("DappToken.json", function(dappToken){
                    App.contracts.DappToken = TruffleContract(dappToken);
                    App.contracts.DappToken.setProvider(App.web3Provider);
                    App.contracts.DappToken.deployed().then(function(dappToken){
                        console.log("Dapp Token Address:", dappToken.address);
                      
                    });
                    App.listenForEvents();
                   return App.render();
                });
              
            });
    },
    listenForEvents: function(){
       App.contracts.DappTokenSale.deployed().then(function(instance){        
        instance.contract.events.Sell({
            fromBlock: 'latest'
        }, function(error, event){ console.log(event); })
        .on('data', function(event){
            console.log("event handler");
            console.log(event); // same results as the optional callback above
            App.render();
        })
        .on('changed', function(event){
            // remove event from local database
        })
        .on('error', console.error);
      });
    
    },
    render: function(){
        if(App.loading){
            return;
        }
       // App.loading
        var loader = $("#loader");
        var content = $("#content");
        web3.eth.getCoinbase((err, acct)=>{
            App.account = acct;
            console.log(App.account)
            $("#accountAddress").html("Your Account: " + App.account);
            console.log(App.account);
            let dappTokenSaleInstance = null;
            let dappTokenInstance = null;
            App.contracts.DappTokenSale.deployed().then(function(instance){
            dappTokenSaleInstance = instance;
            return dappTokenSaleInstance.tokenPrice();
        }).then(function(price){
            App.tokenPrice = price.toNumber();
           // console.log(web3.utils.fromWei(price, "ether"));
            $(".token-price").html(web3.utils.fromWei(price, "ether"));
            return dappTokenSaleInstance.tokensSold()
        }).then(function(tokensSold){
            App.tokensSold =tokensSold.toNumber();
            $("#tokensold").html(App.tokensSold);
            $("#tokensAvailable").html(App.tokensAvailable);
            var progreesPercent = (App.tokensSold/App.tokensAvailable)*100;
            $(".progress-bar").css('width', progreesPercent + '%');
            App.contracts.DappToken.deployed().then(function(instance){
                dappTokenInstance = instance;
                return dappTokenInstance.balanceOf(App.account);
            }).then(function(balance){
                $(".dapp-balance").html(balance.toNumber());
                App.loading = false;
                $("#loader").hide();
                $("#content").show();
              
            })
        })
        });
        
    
    },
    buyTokens: function(){
        $("#content").hide();
        $("#loader").show();
        var numberOfTokens = $("#numberOfToken").val();
        App.contracts.DappTokenSale.deployed().then(function(instance){
            return instance.buyTokens(numberOfTokens, {
                from: App.account,
                value: numberOfTokens* App.tokenPrice,
                gas: 500000
            }).then(function(result){
                console.log("----------------------------");
                console.log(result);
                console.log("Tokens Bought");
              //  App.render();
              //wait for sell events
            })
        })
    }
}

$(function() {
    newFunction();
});

function newFunction() {
    App.init(); 
}
