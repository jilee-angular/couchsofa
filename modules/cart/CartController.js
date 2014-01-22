

angular
    .module('CouchCommerceApp')
    .controller('CartController',
    [
        '$scope','basketService', 'navigationService', 'checkoutService', 'configService', 'payPalOverlayService', 'dialog',
        function CartController($scope, basketService, navigationService, checkoutService, configService, payPalOverlayService, dialog) {
            'use strict';

            $scope.basketService = basketService;
            $scope.navigationService = navigationService;
            $scope.configService = configService;

            var updateModels = function(){
                $scope.summary = basketService.getSummary();

                //that's a bit of a hack. We use the total box for both cart
                //and summary page. In the summary page we always have a server generated
                //shipping. However, in the cart we might want to show a link to the
                //shipping costs page. The total box checks for shipping === null to
                //either show the link or the value.
                if(configService.get('shippingCost') === null){
                    $scope.summary.shipping = null;
                }

                $scope.items = basketService.getItems();
                $scope.isEmpty = $scope.items.length === 0;
            };

            updateModels();

            basketService
                .on('cleared', updateModels)
                .on('itemAdded', updateModels)
                .on('itemRemoved', updateModels);

            $scope.decreaseItem = function(item){
                if (item.quantity > 1){
                    basketService.decreaseOne(item);
                }
                else {
                    dialog
                        .messageBox(
                            $scope.ln.btnWarning, 
                            $scope.ln.cartDelMsg, 
                            [{result: 'cancel', label: $scope.ln.btnCancel}, {result: 'ok', label: $scope.ln.btnYes}]
                        )
                        .result
                        .then(function(result){
                            if(result === 'ok'){
                                basketService.decreaseOne(item);
                            }
                        });
                }
            };

            $scope.checkoutWithPayPal = function(){
                payPalOverlayService.startPayPalCheckout();
            };
        }
    ]);