def is_odd(n):
    return n % 2 !=0
numbers=[1,2,3,4,5,6,7,8,9,]
odd_numbers = filter(is_odd,numbers)
print(list(odd_numbers))