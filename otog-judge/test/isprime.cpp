// isprime
#include <iostream>
#include <vector>
using namespace std;

int main () {
    int nu2 = 0;
    // for (int i = 0; i < 500000000; ++i) { // TO
    //     nu2 += i;
    // }
    std::vector<int> vec(2800000, 0);
    std::cin >> vec[0];
    int num = vec[0];
    for (int i = 2; i < num; ++i) {
        if (num % i == 0) {
            std::cout << "not_prime" << std::endl;
            return 0;
        }
    }
    std::cout << "prime" << std::endl;
    return 0;
}